package org.me.CoViKoa;

import org.apache.jena.graph.Graph;
import org.apache.jena.graph.Node;
import org.apache.jena.graph.NodeFactory;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.sparql.core.Var;
import org.apache.jena.sparql.engine.ExecutionContext;
import org.apache.jena.sparql.engine.QueryIterator;
import org.apache.jena.sparql.engine.binding.Binding;
import org.apache.jena.sparql.pfunction.PFuncAssignToObject;
import org.apache.jena.sparql.pfunction.PropertyFunction;
import org.apache.jena.sparql.pfunction.PropertyFunctionFactory;
import org.apache.jena.sparql.util.IterLib;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.concurrent.ConcurrentHashMap;

public class SymboliserSerialisationPropertyFunction implements PropertyFunctionFactory {
    private ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();

    @Override
    public PropertyFunction create(final String uri)
    {
        return new PFuncAssignToObject()
        {
            @Override
            public QueryIterator execEvaluated(final Binding binding, final Node subject, final Node predicate, final Node object, final ExecutionContext execCxt)
            {
                String iriResource;
                String formattedIriResource;
                JSONObject obj;
                if (subject.isBlank()) {
                    iriResource = subject.getBlankNodeId().getLabelString();
                    formattedIriResource = "<_:" + subject.getBlankNodeId().getLabelString() + ">" ;
                } else {
                    iriResource = subject.getURI();
                    formattedIriResource = "<" + subject.getURI() + ">";
                }
                String resultString = cache.get(formattedIriResource);
                if(resultString != null) {
                    Node result = NodeFactory.createLiteral(resultString);
                    return IterLib.oneResult(binding, Var.alloc(object), result, execCxt) ;
                }
                Graph graph = execCxt.getActiveGraph();
                Model model = ModelFactory.createModelForGraph(graph);

                LoggerFactory.getLogger(SymboliserSerialisationPropertyFunction.class)
                        .debug("Serialising symbolizer...");

                String symbolizerType = getSymbolizerType(model, formattedIriResource);

                if (symbolizerType.equals("https://gis.lu.se/ont/data_portrayal/symbolizer#PointSymbolizer")) {
                    obj = extractPointSymbolizer(model, formattedIriResource);
                } else if (symbolizerType.equals("https://gis.lu.se/ont/data_portrayal/symbolizer#LineSymbolizer")) {
                    obj = extractLineSymbolizer(model, formattedIriResource);
                } else if (symbolizerType.equals("https://gis.lu.se/ont/data_portrayal/symbolizer#PolygonSymbolizer")) {
                    obj = extractPolygonSymbolizer(model, formattedIriResource);
                } else if (symbolizerType.equals("https://gis.lu.se/ont/data_portrayal/symbolizer#TextSymbolizer")) {
                    obj = extractTextSymbolizer(model, formattedIriResource);
                } else if(symbolizerType.equals("https://gis.lu.se/ont/data_portrayal/symbolizer#CompositeSymbolizer")) {
                    LoggerFactory.getLogger(SymboliserSerialisationPropertyFunction.class)
                            .warn("CompositeSymbolizers are not supported.");
                    return IterLib.oneResult(binding, Var.alloc(object), NodeFactory.createLiteral(""), execCxt) ;
                } else {
                    LoggerFactory.getLogger(SymboliserSerialisationPropertyFunction.class)
                            .warn("Subject of property asGeoStylerJSON is not a Symbolizer.");
                    return IterLib.oneResult(binding, Var.alloc(object), NodeFactory.createLiteral(""), execCxt) ;
                }
                //Node result = calc(subject);
                resultString = obj.toJSONString();
                Node result = NodeFactory.createLiteral(resultString);
                cache.put(formattedIriResource, resultString);
                return IterLib.oneResult(binding, Var.alloc(object), result, execCxt) ;
            }

            @Override
            public Node calc(Node node) {
                return null;
            }

        };
    }

    private String getSymbolizerType(Model model, String formattedIriResource) {
        Query q = QueryFactory.create("" +
                "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
                "PREFIX symblzr: <https://gis.lu.se/ont/data_portrayal/symbolizer#>\n" +
                "SELECT ?s ?symbolizerType WHERE {\n" +
                "  BIND(" + formattedIriResource + " as ?s) .\n" +
                "  ?s a ?symbolizerType ." +
                "  ?symbolizerType rdfs:subClassOf symblzr:Symbolizer .\n" +
                "  FILTER(?symbolizerType != symblzr:Symbolizer) ." +
                "}");

        QueryExecution qexec = QueryExecutionFactory.create(q, model);
        ResultSet resultSet = qexec.execSelect();

        QuerySolution soln = resultSet.nextSolution();
        if (soln.get("symbolizerType") != null) {
            return soln.get("symbolizerType").toString();
        }
        return null;
    }

    private JSONObject extractPointSymbolizer(Model model, String formattedIriResource) {
        Query q = QueryFactory.create("" +
                "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
                "PREFIX symblzr: <https://gis.lu.se/ont/data_portrayal/symbolizer#>\n" +
                "PREFIX graphic: <https://gis.lu.se/ont/data_portrayal/graphic#>\n" +
                "SELECT ?s ?gs ?sizePoint ?mark ?markName ?markStrokeColor ?markStrokeWidth ?markStrokeDashArray ?markStrokeDashOffset ?markFillColor ?extGraphic ?extGraphicExternalResource ?extGraphicFormat WHERE {\n" +
                "  BIND(" + formattedIriResource + " as ?s) .\n" +
                "  ?s graphic:hasGraphicSymbol ?gs ." +
                "  OPTIONAL { ?gs graphic:size ?sizePoint . }\n" +
                "  {\n" +
                "    ?gs graphic:hasMark ?mark .\n" +
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
                "    ?gs graphic:hasExternalGraphic ?extGraphic .\n" +
                "    OPTIONAL { ?extGraphic graphic:onlineResource ?extGraphicExternalResource . }\n" +
                "    OPTIONAL { ?extGraphic graphic:format ?extGraphicFormat . }\n" +
                "  }\n" +
                "}");

        QueryExecution qexec = QueryExecutionFactory.create(q, model);
        ResultSet resultSet = qexec.execSelect();

        JSONObject obj = new JSONObject();
        QuerySolution soln = resultSet.nextSolution();
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
        return obj;
    }

    private JSONObject extractLineSymbolizer(Model model, String formattedIriResource) {
        Query q = QueryFactory.create("" +
                "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
                "prefix symblzr: <https://gis.lu.se/ont/data_portrayal/symbolizer#>\n" +
                "prefix graphic: <https://gis.lu.se/ont/data_portrayal/graphic#>\n" +
                "\n" +
                "SELECT ?s ?stroke ?strokeColor ?strokeWidth ?strokeDashArray ?strokeDashOffset ?mark ?markName ?markStrokeColor ?markStrokeWidth ?markStrokeDashArray ?markStrokeDashOffset ?markFillColor ?extGraphic ?extGraphicExternalResource ?extGraphicFormat  WHERE {\n" +
                "  BIND(" + formattedIriResource + " as ?s) .\n" +
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

        QueryExecution qexec = QueryExecutionFactory.create(q, model);
        ResultSet resultSet = qexec.execSelect();

        JSONObject obj = new JSONObject();
        QuerySolution soln = resultSet.nextSolution();
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

        return obj;
    }

    private JSONObject extractPolygonSymbolizer(Model model, String formattedIriResource) {
        Query q = QueryFactory.create("" +
                "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
                "prefix symblzr: <https://gis.lu.se/ont/data_portrayal/symbolizer#>\n" +
                "prefix graphic: <https://gis.lu.se/ont/data_portrayal/graphic#>\n" +
                "\n" +
                "SELECT ?s ?fillColor ?stroke ?strokeColor ?strokeWidth ?strokeDashArray ?strokeDashOffset ?mark ?markName ?markStrokeColor ?markStrokeWidth ?markStrokeDashArray ?markStrokeDashOffset ?markFillColor ?extGraphic ?extGraphicExternalResource ?extGraphicFormat  WHERE {\n" +
                "  BIND(" + formattedIriResource + " as ?s) .\n" +
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

        QueryExecution qexec = QueryExecutionFactory.create(q, model);
        ResultSet resultSet = qexec.execSelect();

        JSONObject obj = new JSONObject();
        QuerySolution soln = resultSet.nextSolution();
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
        return obj;
    }

    private JSONObject extractTextSymbolizer(Model model, String formattedIriResource) {
        Query q = QueryFactory.create("" +
                "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
                "prefix symblzr: <https://gis.lu.se/ont/data_portrayal/symbolizer#>\n" +
                "prefix graphic: <https://gis.lu.se/ont/data_portrayal/graphic#>\n" +
                "\n" +
                "SELECT ?s ?textLabel ?fontFamily ?fontSize ?fontWeight ?fontStyle ?fillColor ?halo WHERE {\n" +
                "  BIND(" + formattedIriResource + " as ?s) .\n" +
                "  ?s graphic:textLabel ?textLabel .\n" +
                "  OPTIONAL {\n" +
                "    ?s graphic:hasFont ?font .\n" +
                "    OPTIONAL { ?font graphic:fontFamily ?fontFamily .}\n" +
                "    OPTIONAL { ?font graphic:fontSize ?fontSize .}\n" +
                "    OPTIONAL { ?font graphic:fontWeight ?fontWeight .}\n" +
                "    OPTIONAL { ?font graphic:fontStyle ?fontStyle .}\n" +
                "  }\n" +
                "  OPTIONAL {\n" +
                "    ?s graphic:hasFill ?fill .\n" +
                "    OPTIONAL { ?fill graphic:fillColor ?fillColor .}\n" +
                "  }\n" +
                "  OPTIONAL {\n" +
                "    ?s graphic:hasHalo ?halo .\n" +
                "  }\n" +
                "}");

        QueryExecution qexec = QueryExecutionFactory.create(q, model);
        ResultSet resultSet = qexec.execSelect();

        JSONObject obj = new JSONObject();
        QuerySolution soln = resultSet.nextSolution();
        obj.put("kind", "Text");
        if (soln.get("fillColor") != null) {
            obj.put("color", soln.getLiteral("fillColor").getString());
        }
        if (soln.get("fontSize") != null) {
            obj.put("size", soln.getLiteral("fontSize").getInt());
        }
        if (soln.get("fontWeight") != null) {
            obj.put("fontWeight", soln.getLiteral("fontWeight").getString());
        }
        if (soln.get("fontStyle") != null) {
            obj.put("fontStyle", soln.getLiteral("fontStyle").getString());
        }
        if (soln.get("textLabel") != null) {
            obj.put("label", soln.getLiteral("textLabel").getString());
        }
        if (soln.get("halo") != null) {
            obj.put("haloColor", "#FFFFFF");
            obj.put("haloWidth", 1);
        }
        if (soln.get("fontFamily") != null) {
            JSONArray a = new JSONArray();
            a.add(soln.getLiteral("fontFamily").getString());
            obj.put("font", a);
        }
        return obj;
    }
}
