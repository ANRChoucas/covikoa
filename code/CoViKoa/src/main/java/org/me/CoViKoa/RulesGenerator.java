package org.me.CoViKoa;

import org.apache.jena.ontology.OntModel;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.*;
import org.apache.jena.update.UpdateAction;
import org.apache.jena.update.UpdateException;
import org.apache.jena.util.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.topbraid.jenax.util.JenaUtil;
import org.topbraid.shacl.rules.RuleUtil;
import org.topbraid.shacl.validation.ValidationUtil;
import org.topbraid.shacl.vocabulary.SH;

import java.io.FileInputStream;
import java.io.FileNotFoundException;


public class RulesGenerator {
    private final static Logger logger = LoggerFactory.getLogger(RulesGenerator.class);
    public final OntModel derivationModel;
    public final Model shapeModel;
    public Model generatedRules;

    public final String pathRuleFile = "rdf/rules-generation-rules.ttl";
    public final String pathRuleBaseFunctions = "rdf/rules-base-functions.ttl";
    public final String pathShapeVerifFile = "rdf/shapes-derivation-model.ttl";

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
        Resource reportResource = ValidationUtil.validateModel(derivationModel, shapeVerif, false);
        boolean conforms = reportResource.getProperty(SH.conforms).getBoolean();
        logger.warn("Derivation Model conforms to shape = " + conforms);
        if(!conforms){
            Utils.warnWithModel(reportResource.getModel(), logger);
        }

        // Generate new Portrayals if any...
        Model transformationResult = ModelTransformator.getNewDeclarations(derivationModel);
        if(transformationResult.size() > 0) {
            Utils.warnWithModel(transformationResult, logger);
            derivationModel.add(transformationResult);
        }

        // Load the SHACL rules dedicated to generating the new SHACL rules for CoViKoa
        this.shapeModel = JenaUtil.createDefaultModel();
        shapeModel.read(new FileInputStream(pathRuleFile), null, FileUtils.langTurtle);

        // Load some functions used internally by CoViKoa
        Model baseFunctions = JenaUtil.createDefaultModel();
        baseFunctions.read(new FileInputStream(pathRuleBaseFunctions), null, FileUtils.langTurtle);

        // Transfer the prefixes, declared in the Derivation Model, to be injected in the generated
        // SHACL/SPARQL rules
        transferPrefixesToInject(derivationModel, baseFunctions);

        // We need some of these functions during the rule generation
        shapeModel.add(baseFunctions);

        // Actually generate the rules from the derivation model
        generatedRules = JenaUtil.createDefaultModel();
        Model results = RuleUtil.executeRules(derivationModel, shapeModel, generatedRules, null);

        // Also add the base function loaded earlier to the new rules graph
        generatedRules.add(baseFunctions);

        // Because the derivation model might contain rules
        // (linked to some individual with cvkd:hasDataIntegrationRule)
        // we extract it from the Derivation Model to add it
        // in the graph corresponding to the generated rules
        Query query = QueryFactory.create("" +
                "prefix sh: <http://www.w3.org/ns/shacl#>\n" +
                "prefix cvkd: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                "\n" +
                "DESCRIBE ?n\n" +
                "WHERE {\n" +
                "   ?c cvkd:hasDataIntegrationRule ?n ." +
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
                "prefix cvkd: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                "prefix owl: <http://www.w3.org/2002/07/owl#>\n" +
                "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "" +
                "INSERT DATA {\n" +
                "    cvkd:prefixToInject a cvkd:PrefixToInject ;" +
                "        rdf:value \"" + toInjectLater + "\" ." +
                "} " +
                "", derivationModel);
    }
}
