package org.me.CoViKoa;

import com.fasterxml.jackson.databind.util.JSONPObject;
import org.apache.jena.atlas.json.JsonBuilder;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.*;
import org.apache.jena.update.UpdateAction;
import org.apache.jena.update.UpdateException;
import org.apache.jena.util.FileUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.topbraid.jenax.util.JenaUtil;
import org.topbraid.shacl.rules.RuleUtil;
import org.topbraid.shacl.validation.ValidationUtil;
import org.topbraid.shacl.vocabulary.SH;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;


public class RulesGenerator {
    private final static Logger logger = LoggerFactory.getLogger(RulesGenerator.class);
    public final OntModel derivationModel;
    public final Model shapeModel;
    public Model generatedRules;

    public final String pathRuleFile = "rdf/rules-generation-rules.ttl";
    public final String pathRuleBaseFunctions = "rdf/rules-base-functions.ttl";
    public final String pathShapeVerifFile = "rdf/shapes-derivation-model.ttl";

    public static void main(String[] args) throws FileNotFoundException {
        org.apache.jena.query.ARQ.init();

        RulesGenerator a = new RulesGenerator("rdf/case_study_4/derivation-model-nuts2.ttl");
        try {
            Utils.saveModel(a.generatedRules, "/tmp/result-rules-generation.ttl");
            Utils.saveModel(a.derivationModel, "/tmp/result-derivation-model.ttl");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public RulesGenerator(String pathDerivationModel) throws FileNotFoundException {
        org.apache.jena.query.ARQ.init();
        long startTime;
        long endTime;
        startTime = System.currentTimeMillis();

        // Load the derivation model written by the user
        this.derivationModel = ModelFactory.createOntologyModel();
        derivationModel.read(new FileInputStream(pathDerivationModel), null, FileUtils.langTurtle);

        // Load the shapes expected for the derivation model
        Model shapeVerif = JenaUtil.createDefaultModel();
        shapeVerif.read(new FileInputStream(pathShapeVerifFile), null, FileUtils.langTurtle);

        // Validate the derivation model against these shapes
        Resource reportResource = ValidationUtil.validateModel(derivationModel, shapeVerif, true);
        boolean conforms = reportResource.getProperty(SH.conforms).getBoolean();
        logger.warn("Derivation Model conforms to shape = " + conforms);
        if(!conforms){
            Utils.warnWithModel(reportResource.getModel(), logger);
        }

        // Load the SHACL rules dedicated to generating the new SHACL rules for CoViKoa
        this.shapeModel = JenaUtil.createDefaultModel();
        shapeModel.read(new FileInputStream(pathRuleFile), null, FileUtils.langTurtle);

        // Load some functions used internally by CoViKoa
        Model baseFunctions = ModelFactory.createOntologyModel();
        baseFunctions.read(new FileInputStream(pathRuleBaseFunctions), null, FileUtils.langTurtle);

        // Transfer the prefixes, declared in the Derivation Model, to be injected in the generated
        // SHACL/SPARQL rules
        this.transferPrefixesToInject(derivationModel, baseFunctions);

        // Transform the various cases of MatchingPattern (provided as a single property or as
        // a list of properties) to their literal value
        // to inject later in SHACL/SPARQL rules too
        this.transformMatchingPattern(derivationModel);

        // Same for the cvkr:pathFromGVA (provided as a list of properties in the Derivation Model)
        this.transformPathFromApplication(derivationModel);

        // Prepare the cvkr:transformOperation, defined using function expression in the Derivation Model
        // for their later injection
        this.rewriteTransformOperation(derivationModel);

        // Rewrite the specification of each symbolizer in the derivation model
        // in JSON format (somewhat voluntarily similar to "geostyler" format)
        this.rewriteSymbolizers(derivationModel);

        // Actually generate the rules from the derivation model
        generatedRules = JenaUtil.createDefaultModel();
        Model results = RuleUtil.executeRules(derivationModel, shapeModel, generatedRules, null);

        // Add the base function loaded earlier
        generatedRules.add(baseFunctions);

        // Because the derivation model might contain rules
        // (linked to some individual with cvkr:hasDataIntegrationRule)
        // we extract it from the Derivation Model to add it
        // in the graph corresponding to the generated rules
        Query query = QueryFactory.create("" +
                "prefix sh: <http://www.w3.org/ns/shacl#>\n" +
                "prefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                "\n" +
                "DESCRIBE ?n\n" +
                "WHERE {\n" +
                "   ?c cvkr:hasDataIntegrationRule ?n ." +
                "   ?n a sh:NodeShape .\n" +
                "}");
        QueryExecution qexec = QueryExecutionFactory.create(query, derivationModel);
        Model resultModel = qexec.execDescribe();
        qexec.close();
        generatedRules.add(resultModel);

        endTime = System.currentTimeMillis() - startTime;
        logger.info("Rule generation took " + endTime + "ms");
    }

    public static void transferPrefixesToInject(Model derivationModel, Model baseFunctions) {
        // Transfer the prefix(es) declared in the derivation model to the rule graph
        Query q1 = QueryFactory.create("" +
                "prefix sh: <http://www.w3.org/ns/shacl#>\n" +
                "\n" +
                "SELECT ?prefix ?uri\n" +
                "WHERE {\n" +
                "   ?o sh:declare [ sh:prefix ?prefix ; sh:namespace ?uri ; ] .\n" +
                "}");
        QueryExecution qexec1 = QueryExecutionFactory.create(q1, derivationModel);
        ResultSet resultSet = qexec1.execSelect();
        String toInjectLater = "";
        while (resultSet.hasNext())
        {
            QuerySolution soln = resultSet.nextSolution() ;
            String prefix = soln.get("prefix").toString();
            String uri = soln.get("uri")
                    .toString()
                    .replace("^^http://www.w3.org/2001/XMLSchema#anyURI", "");
            try {
                UpdateAction.parseExecute("" +
                        "prefix sh: <http://www.w3.org/ns/shacl#>\n" +
                        "prefix owl: <http://www.w3.org/2002/07/owl#>\n" +
                        "INSERT {\n" +
                        "    ?o sh:declare [ sh:prefix \"" + prefix + "\" ; sh:namespace \"" + uri + "\"^^<http://www.w3.org/2001/XMLSchema#anyURI> ; ] .\n" +
                        "} WHERE {\n" +
                        "    ?o a owl:Ontology ;\n" +
                        "        owl:imports ?_ ." +
                        "}" +
                        "", baseFunctions);
                toInjectLater += ("prefix " + prefix + ": <" + uri + "> ");
            } catch (UpdateException e) {
                e.printStackTrace();
            }
        }
        qexec1.close();

        // For prefix injection in generated rules
        UpdateAction.parseExecute("" +
                "prefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                "prefix owl: <http://www.w3.org/2002/07/owl#>\n" +
                "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "" +
                "INSERT DATA {\n" +
                "    cvkr:prefixToInject a cvkr:PrefixToInject ;" +
                "        rdf:value \"" + toInjectLater + "\" ." +
                "} " +
                "", derivationModel);
    }

    // Here we transform the patternProperty or the patternPropertyChain defined for a MatchingPattern into its
    // literal SPARQL value to facilitate its injection later
    // (this is especially useful for the case of the patternPropertyChain, but for a question of homogeneity
    // of the injection method which follows and mobilizes other elements... we do it like this)
    public static void transformMatchingPattern(Model derivationModel) {
        // Transformation if cvkr:PatternProperty is used
        Query q1 = QueryFactory.create("" +
                "prefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "\n" +
                "SELECT ?matchingPattern ?targetProp\n" +
                "WHERE {\n" +
                "   ?matchingPattern a cvkr:MatchingPattern ;\n" +
                "                    cvkr:patternProperty ?targetProp .\n" +
                "}");
        QueryExecution qexec1 = QueryExecutionFactory.create(q1, derivationModel);
        ResultSet resultSet1 = qexec1.execSelect();

        HashMap<String, String> results = new HashMap<String, String>();
        while (resultSet1.hasNext()) {
            QuerySolution soln = resultSet1.nextSolution();
            String pattern = "<" + soln.get("matchingPattern").toString() + ">";
            String targetProp = " <" + soln.get("targetProp").toString() + "> ";
            results.put(pattern, targetProp);
        }
        qexec1.close();

        for (String patternUri : results.keySet()) {
            UpdateAction.parseExecute("" +
                    "prefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                    "prefix xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
                    "" +
                    "INSERT DATA {\n" +
                    "    " + patternUri + " cvkr:patternPropertyLiteral \"" + results.get(patternUri) + "\"^^xsd:string ." +
                    "} " +
                    "", derivationModel);
        }

        // Transformation if cvkr:patternPropertyChain is used
        Query q2 = QueryFactory.create("" +
                "prefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "prefix list: <http://jena.apache.org/ARQ/list#>\n" +
                "\n" +
                "SELECT ?matchingPattern ?l ?e\n" +
                "WHERE {\n" +
                "   ?matchingPattern a cvkr:MatchingPattern ;\n" +
                "                    cvkr:patternPropertyChain ?l .\n" +
                "   ?l rdf:rest*/rdf:first ?e ." +
                "}");
        QueryExecution qexec2 = QueryExecutionFactory.create(q2, derivationModel);
        ResultSet resultSet2 = qexec2.execSelect();
        Integer count = 0;

        HashMap<String, ArrayList<String>> results2 = new HashMap<String, ArrayList<String>>();
        while (resultSet2.hasNext()) {
            QuerySolution soln = resultSet2.nextSolution();
            String pattern = "<" + soln.get("matchingPattern").toString() + ">";

            ArrayList<String> result;
            if (results2.containsKey(pattern)) {
                result = results2.get(pattern);
            } else {
                result = new ArrayList<String>();
            }

            // 'e' is each list element
            String e = soln.get("e").toString();
            result.add("<" + e + ">");
            results2.put(pattern, result);
        }
        qexec2.close();

        for (String patternUri : results2.keySet()) {
            String propertyPath = " " + String.join("/", results2.get(patternUri)) + " ";
            UpdateAction.parseExecute("" +
                    "prefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                    "prefix xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
                    "" +
                    "INSERT DATA {\n" +
                    "    " + patternUri + " cvkr:patternPropertyLiteral \"" + propertyPath + "\"^^xsd:string ." +
                    "} " +
                    "", derivationModel);
        }
    }

    // Here we transform the path between the "entry point" concept, defined for a GeoVisualApplication
    // and a concept to be geovisually portrayed.
    // This path is written as a rdf:list in the Derivation Model (the list of property to be followed
    // from the entry point concept to the concept to be portrayed).
    // We rewrite it as a SPARQL path sequence (see https://www.w3.org/TR/sparql11-property-paths/)
    // and store it in the Derivation Model for later injection.
    public static void transformPathFromApplication(Model derivationModel) {
        Query q1 = QueryFactory.create("" +
                "prefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "\n" +
                "SELECT ?c ?li ?e \n" +
                "WHERE {\n" +
                "   ?c cvkr:pathFromGVA ?li .\n" +
                "   ?li rdf:rest*/rdf:first ?e ." +
                "}");
        QueryExecution qexec1 = QueryExecutionFactory.create(q1, derivationModel);
        ResultSet resultSet = qexec1.execSelect();

        HashMap<String, ArrayList<String>> results = new HashMap<String, ArrayList<String>>();
        while (resultSet.hasNext()) {
            QuerySolution soln = resultSet.nextSolution();
            String targetConcept = "<" + soln.get("c").toString() + ">";
            ArrayList<String> result;
            if (results.containsKey(targetConcept)) {
                result = results.get(targetConcept);
            } else {
                result = new ArrayList<String>();
            }

            // 'e' is each list element
            String e = soln.get("e").toString();
            result.add("<" + e + ">");
            results.put(targetConcept, result);
        }

        for (String conceptUri : results.keySet()) {
            String value = " " + String.join("/", results.get(conceptUri)) + " ";
            UpdateAction.parseExecute("" +
                    "prefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                    "prefix xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
                    "" +
                    "INSERT DATA {\n" +
                    "    " + conceptUri + " cvkr:pathFromGVALiteral \"" + value + "\"^^xsd:string ." +
                    "} " +
                    "", derivationModel);
        }
    }

    public static void rewriteSymbolizers(Model derivationModel) {
        rewritePointSymbolizers(derivationModel);
        rewriteLineSymbolizers(derivationModel);
        rewritePolygonSymbolizers(derivationModel);
    }

    private static void rewritePointSymbolizers(Model derivationModel) {
        Query q = QueryFactory.create("" +
                "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
                "PREFIX symblzr: <https://gis.lu.se/ont/data_portrayal/symbolizer#>\n" +
                "PREFIX graphic: <https://gis.lu.se/ont/data_portrayal/graphic#>\n" +
                "SELECT ?s ?sizePoint ?mark ?markName ?markStrokeColor ?markStrokeWidth ?markStrokeDashArray ?markStrokeDashOffset ?markFillColor ?extGraphic ?extGraphicExternalResource ?extGraphicFormat WHERE {\n" +
                "  ?s a symblzr:PointSymbolizer .\n" +
                "  OPTIONAL { ?s graphic:size ?sizePoint . }\n" +
                "  {\n" +
                "    ?s graphic:hasMark ?mark .\n" +
                "    OPTIONAL { ?mark graphic:hasWellKnownName [ rdfs:label ?markName ] . }\n" +
                "    OPTIONAL {\n" +
                "      ?mark graphic:hasStroke ?markStroke .\n" +
                "      OPTIONAL { ?markStroke graphic:strokeColor ?markStrokeColor .}\n" +
                "      OPTIONAL { ?markStroke graphic:strokeWidth ?markStrokeWidth .}\n" +
                "      OPTIONAL { ?markStroke graphic:strokeDashArray ?markStrokeDashArray .}\n" +
                "      OPTIONAL { ?markStroke graphic:strokeDashOffset ?markStrokeDashOffset .}\n" +
                "    }\n" +
                "    OPTIONAL {\n" +
                "      ?mark graphic:hasFill ?markFill .\n" +
                "      OPTIONAL { ?markFill graphic:fillColor ?markFillColor . }\n" +
                "    }\n" +
                "  } UNION {\n" +
                "    ?s graphic:hasExternalGraphic ?extGraphic .\n" +
                "    OPTIONAL { ?extGraphic graphic:onlineResource ?extGraphicExternalResource . }\n" +
                "    OPTIONAL { ?extGraphic graphic:format ?extGraphicFormat . }\n" +
                "  }\n" +
                "}");

        QueryExecution qexec = QueryExecutionFactory.create(q, derivationModel);
        ResultSet resultSet = qexec.execSelect();

        HashMap<String, String> results = new HashMap<String, String>();
        while (resultSet.hasNext()) {
            JSONObject obj = new JSONObject();
            QuerySolution soln = resultSet.nextSolution();
            String targetSymbolizer = "<" + soln.get("s").toString() + ">";
            if (soln.get("mark") != null) {
                obj.put("kind", "Mark");
                if (soln.get("sizePoint") != null) {
                    obj.put("radius", soln.getLiteral("sizePoint").getDouble());
                }
                if (soln.get("markFillColor") != null) {
                    obj.put("color", soln.getLiteral("markFillColor").getString());
                }
                if (soln.get("markStrokeColor") != null) {
                    obj.put("strokeColor", soln.getLiteral("markStrokeColor").getString());
                }
                if (soln.get("markStrokeWidth") != null) {
                    obj.put("strokeWidth", soln.getLiteral("markStrokeWidth").getString());
                }
                if (soln.get("markName") != null) {
                    obj.put("wellKnownName", soln.getLiteral("markName").getString());
                } else {
                    obj.put("wellKnownName", "circle");
                }
            } else if (soln.get("extGraphic") != null) {
                obj.put("kind", "Icon");
                if (soln.get("sizePoint") != null) {
                    obj.put("size", soln.getLiteral("sizePoint").getDouble());
                }
                if (soln.get("extGraphicExternalResource") != null) {
                    obj.put("image", soln.getLiteral("extGraphicExternalResource").getString());
                }
            }
            results.put(targetSymbolizer, obj.toJSONString());
        }
        updateSymbolizers(results, derivationModel);
    }

    private static void rewriteLineSymbolizers(Model derivationModel) {
        Query q = QueryFactory.create("" +
                "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
                "prefix symblzr: <https://gis.lu.se/ont/data_portrayal/symbolizer#>\n" +
                "prefix graphic: <https://gis.lu.se/ont/data_portrayal/graphic#>\n" +
                "\n" +
                "SELECT ?s ?stroke ?strokeColor ?strokeWidth ?strokeDashArray ?strokeDashOffset ?mark ?markName ?markStrokeColor ?markStrokeWidth ?markStrokeDashArray ?markStrokeDashOffset ?markFillColor ?extGraphic ?extGraphicExternalResource ?extGraphicFormat  WHERE {\n" +
                "  ?s a symblzr:LineSymbolizer .\n" +
                "  ?s graphic:hasStroke ?stroke .\n" +
                "  OPTIONAL { ?stroke graphic:strokeColor ?strokeColor .}\n" +
                "  OPTIONAL { ?stroke graphic:strokeWidth ?strokeWidth .}\n" +
                "  OPTIONAL { ?stroke graphic:strokeDashArray ?strokeDashArray .}\n" +
                "  OPTIONAL { ?stroke graphic:strokeDashOffset ?strokeDashOffset .}\n" +
                "  OPTIONAL {\n" +
                "    ?stroke graphic:hasGraphicStroke ?graphicStroke .\n" +
                "    {\n" +
                "      ?graphicStroke graphic:hasMark ?mark .\n" +
                "      OPTIONAL { ?mark graphic:hasWellKnownName [ rdfs:label ?markName ] . }\n" +
                "      OPTIONAL {\n" +
                "        ?mark graphic:hasStroke ?markStroke .\n" +
                "        OPTIONAL { ?markStroke graphic:strokeColor ?markStrokeColor .}\n" +
                "        OPTIONAL { ?markStroke graphic:strokeWidth ?markStrokeWidth .}\n" +
                "        OPTIONAL { ?markStroke graphic:strokeDashArray ?markStrokeDashArray .}\n" +
                "        OPTIONAL { ?markStroke graphic:strokeDashOffset ?markStrokeDashOffset .}\n" +
                "      }\n" +
                "      OPTIONAL {\n" +
                "        ?mark graphic:hasFill ?markFill .\n" +
                "        OPTIONAL { ?markFill graphic:fillColor ?markFillColor . }\n" +
                "      }\n" +
                "    } UNION {\n" +
                "      ?graphicStroke graphic:hasExternalGraphic ?extGraphic .\n" +
                "      OPTIONAL { ?extGraphic graphic:onlineResource ?extGraphicExternalResource . }\n" +
                "      OPTIONAL { ?extGraphic graphic:format ?extGraphicFormat . }\n" +
                "    }\n" +
                "  }\n" +
                "}\n");

        QueryExecution qexec = QueryExecutionFactory.create(q, derivationModel);
        ResultSet resultSet = qexec.execSelect();

        HashMap<String, String> results = new HashMap<String, String>();
        while (resultSet.hasNext()) {
            JSONObject obj = new JSONObject();
            QuerySolution soln = resultSet.nextSolution();
            String targetSymbolizer = "<" + soln.get("s").toString() + ">";
            obj.put("kind", "Line");
            if (soln.get("strokeColor") != null) {
                obj.put("color", soln.getLiteral("strokeColor").getString());
            }
            if (soln.get("strokeWidth") != null) {
                obj.put("width", soln.getLiteral("strokeWidth").getDouble());
            }
            if (soln.get("strokeDashArray") != null) {
                String v = soln.getLiteral("strokeDashArray").getString();
                JSONArray a = new JSONArray();
                Arrays.stream(v.split(" "))
                        .mapToInt(Integer::parseInt)
                        .forEach((int _v) -> { a.add(_v); });
                obj.put("dashArray", a);
            }
            if (soln.get("strokeDashOffset") != null) {
                obj.put("dashOffset", soln.getLiteral("strokeDashOffset").getDouble());
            }
            // Is there a graphic stroke ?
            if (soln.get("mark") != null) {
                // Nested object for the mark
                JSONObject objgraphicstroke = new JSONObject();
                objgraphicstroke.put("kind", "Mark");
                if (soln.get("sizePoint") != null) {
                    objgraphicstroke.put("radius", soln.getLiteral("sizePoint").getDouble());
                }
                if (soln.get("markFillColor") != null) {
                    objgraphicstroke.put("color", soln.getLiteral("markFillColor").getString());
                }
                if (soln.get("markStrokeColor") != null) {
                    objgraphicstroke.put("strokeColor", soln.getLiteral("markStrokeColor").getString());
                }
                if (soln.get("markName") != null) {
                    objgraphicstroke.put("wellKnownName", soln.getLiteral("markName").getString());
                } else {
                    objgraphicstroke.put("wellKnownName", "circle");
                }
                obj.put("graphicStroke", objgraphicstroke);
            } else if (soln.get("extGraphic") != null) {
                // Nested object for the external resources
                JSONObject objgraphicstroke = new JSONObject();
                objgraphicstroke.put("kind", "Icon");
                if (soln.get("sizePoint") != null) {
                    objgraphicstroke.put("size", soln.getLiteral("sizePoint").getDouble());
                }
                if (soln.get("extGraphicExternalResource") != null) {
                    objgraphicstroke.put("image", soln.getLiteral("extGraphicExternalResource").getString());
                }
                obj.put("graphicStroke", objgraphicstroke);
            }
            results.put(targetSymbolizer, obj.toJSONString());
        }
        updateSymbolizers(results, derivationModel);
    }

    private static void rewritePolygonSymbolizers(Model derivationModel) {
        Query q = QueryFactory.create("" +
                "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
                "prefix symblzr: <https://gis.lu.se/ont/data_portrayal/symbolizer#>\n" +
                "prefix graphic: <https://gis.lu.se/ont/data_portrayal/graphic#>\n" +
                "\n" +
                "SELECT ?s ?fillColor ?stroke ?strokeColor ?strokeWidth ?strokeDashArray ?strokeDashOffset ?mark ?markName ?markStrokeColor ?markStrokeWidth ?markStrokeDashArray ?markStrokeDashOffset ?markFillColor ?extGraphic ?extGraphicExternalResource ?extGraphicFormat  WHERE {\n" +
                "  ?s a symblzr:PolygonSymbolizer .\n" +
                "  OPTIONAL {\n" +
                "    ?s graphic:hasStroke ?stroke .\n" +
                "    OPTIONAL { ?stroke graphic:strokeColor ?strokeColor .}\n" +
                "    OPTIONAL { ?stroke graphic:strokeWidth ?strokeWidth .}\n" +
                "    OPTIONAL { ?stroke graphic:strokeDashArray ?strokeDashArray .}\n" +
                "    OPTIONAL { ?stroke graphic:strokeDashOffset ?strokeDashOffset .}\n" +
                "    OPTIONAL {\n" +
                "      ?stroke graphic:hasGraphicStroke ?graphicStroke .\n" +
                "      {\n" +
                "        ?graphicStroke graphic:hasMark ?mark .\n" +
                "        OPTIONAL { ?mark graphic:hasWellKnownName/rdfs:label ?markName . }\n" +
                "        OPTIONAL {\n" +
                "          ?mark graphic:hasStroke ?markStroke .\n" +
                "          OPTIONAL { ?markStroke graphic:strokeColor ?markStrokeColor .}\n" +
                "          OPTIONAL { ?markStroke graphic:strokeWidth ?markStrokeWidth .}\n" +
                "          OPTIONAL { ?markStroke graphic:strokeDashArray ?markStrokeDashArray .}\n" +
                "          OPTIONAL { ?markStroke graphic:strokeDashOffset ?markStrokeDashOffset .}\n" +
                "        }\n" +
                "        OPTIONAL {\n" +
                "          ?mark graphic:hasFill ?markFill .\n" +
                "          OPTIONAL { ?markFill graphic:fillColor ?markFillColor . }\n" +
                "        }\n" +
                "      } UNION {\n" +
                "        ?graphicStroke graphic:hasExternalGraphic ?extGraphic .\n" +
                "        OPTIONAL { ?extGraphic graphic:onlineResource ?extGraphicExternalResource . }\n" +
                "        OPTIONAL { ?extGraphic graphic:format ?extGraphicFormat . }\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "  OPTIONAL {\n" +
                "    ?s graphic:hasFill ?fill .\n" +
                "    OPTIONAL { ?fill graphic:fillColor ?fillColor .}\n" +
                "  }\n" +
                "}");

        QueryExecution qexec = QueryExecutionFactory.create(q, derivationModel);
        ResultSet resultSet = qexec.execSelect();

        HashMap<String, String> results = new HashMap<String, String>();
        while (resultSet.hasNext()) {
            JSONObject obj = new JSONObject();
            QuerySolution soln = resultSet.nextSolution();
            String targetSymbolizer = "<" + soln.get("s").toString() + ">";
            obj.put("kind", "Fill");
            if (soln.get("fillColor") != null) {
                obj.put("color", soln.getLiteral("fillColor").getString());
            }
            if (soln.get("strokeColor") != null) {
                obj.put("outlineColor", soln.getLiteral("strokeColor").getString());
            }
            if (soln.get("strokeWidth") != null) {
                obj.put("outlineWidth", soln.getLiteral("strokeWidth").getDouble());
            }
            if (soln.get("strokeDashArray") != null) {
                String v = soln.getLiteral("strokeDashArray").getString();
                JSONArray a = new JSONArray();
                Arrays.stream(v.split(" "))
                        .mapToDouble(Double::parseDouble)
                        .forEach((double _v) -> { a.add(_v); });
                obj.put("outlineDashArray", a);
            }
            if (soln.get("strokeDashOffset") != null) {
                obj.put("outlineDashOffset", soln.getLiteral("strokeDashOffset").getDouble());
            }
            results.put(targetSymbolizer, obj.toJSONString());
        }

        updateSymbolizers(results, derivationModel);
    }

    private static void updateSymbolizers(HashMap<String, String> results, Model derivationModel) {
        // Store the JSON serialisation of the symbolizer
        for (String symbolizerUri : results.keySet()) {
            UpdateAction.parseExecute("" +
                    "PREFIX cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                    "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
                    "PREFIX symblzr: <https://gis.lu.se/ont/data_portrayal/symbolizer#>\n" +
                    "" +
                    "INSERT DATA {\n" +
                    "    " + symbolizerUri + " symblzr:asJSON \"\"\"" + results.get(symbolizerUri).replace("\\", "") + "\"\"\"^^xsd:string ." +
                    "} " +
                    "", derivationModel);
        }
    }
    // Here we transform the value of cvkr:transformOperation (from a "SHACL-AF function expression"-like)
    // to a literal value and store it in the Derivation Model for later injection
    // during rule generation.
    public static void rewriteTransformOperation(Model derivationModel) {
        Query q1 = QueryFactory.create("" +
                "prefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                "\n" +
                "SELECT ?c \n" +
                "WHERE {\n" +
                "    ?c cvkr:transformOperation ?_ .\n" +
                "}");
        QueryExecution qexec1 = QueryExecutionFactory.create(q1, derivationModel);
        ResultSet resultSet = qexec1.execSelect();

        HashMap<String, String> results = new HashMap<String, String>();
        while (resultSet.hasNext()) {
            QuerySolution soln = resultSet.nextSolution();
            String targetSymbol = "<" + soln.get("c").toString() + ">";

            Query q2 = QueryFactory.create("" +
                    "prefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                    "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                    "\n" +
                    "SELECT ?func ?listParams ?typeParam ?paramValue \n" +
                    "WHERE {\n" +
                    "   " + targetSymbol + " cvkr:transformOperation [ \n" +
                    "       ?func ?listParams ;" +
                    "   ] .\n" +
                    "   ?listParams rdf:rest*/rdf:first [?typeParam ?paramValue] ." +
                    "}");
            QueryExecution qexec2 = QueryExecutionFactory.create(q2, derivationModel);
            ResultSet resultSet2 = qexec2.execSelect();
            String func = null;
            ArrayList<String> params = new ArrayList<String>();
            while (resultSet2.hasNext()) {
                QuerySolution soln2 = resultSet2.nextSolution();
                if (func == null) {
                    func = "<" + soln2.get("func").toString() + ">";
                }
                Literal value = soln2.get("paramValue").asLiteral();
                String typeValue = soln2.get("typeParam").toString();

                if (typeValue.contains("#value")) {
                    // type is cvkr:value so it's a Literal value to be injected
                    String datatype = value.getDatatypeURI();
                    params.add("\\\"" + value.getString() + "\\\"^^<" + datatype + ">");
                } else {
                    // type is cvkr:variable so it's a variable name and we don't need to quote it
                    params.add(value.toString());
                }
            }
            // Build the string to be injected for this symbol
            StringBuffer rewroteValue = new StringBuffer();
            rewroteValue.append(func);
            rewroteValue.append('(');
            rewroteValue.append(String.join(", ", params));
            rewroteValue.append(')');
            results.put(targetSymbol, rewroteValue.toString());
        }

        // Store the value to be injected on each symb:Symbol using cvkr:transformOperationLiteral property
        for (String symbolUri : results.keySet()) {
            UpdateAction.parseExecute("" +
                    "prefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                    "prefix xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
                    "" +
                    "INSERT DATA {\n" +
                    "    " + symbolUri + " cvkr:transformOperationLiteral \"" + results.get(symbolUri) + "\"^^xsd:string ." +
                    "} " +
                    "", derivationModel);
        }
    }
}
