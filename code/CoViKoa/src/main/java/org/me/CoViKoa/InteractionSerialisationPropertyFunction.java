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
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.concurrent.ConcurrentHashMap;


public class InteractionSerialisationPropertyFunction implements PropertyFunctionFactory  {
    private ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();

    @Override
    public PropertyFunction create(final String uri)
    {
        return new PFuncAssignToObject() {
            @Override
            public QueryIterator execEvaluated(final Binding binding, final Node subject, final Node predicate, final Node object, final ExecutionContext execCxt) {
                String iriResource;
                String formattedIriResource;
                if (subject.isBlank()) {
                    iriResource = subject.getBlankNodeId().getLabelString();
                    formattedIriResource = "<_:" + iriResource + ">" ;
                } else {
                    iriResource = subject.getURI();
                    formattedIriResource = "<" + iriResource + ">";
                }

                String resultString = cache.get(formattedIriResource);
                if(resultString != null) {
                    Node result = NodeFactory.createLiteral(resultString);
                    return IterLib.oneResult(binding, Var.alloc(object), result, execCxt) ;
                }

                Graph graph = execCxt.getActiveGraph();
                Model model = ModelFactory.createModelForGraph(graph);

                LoggerFactory.getLogger(InteractionSerialisationPropertyFunction.class)
                        .debug("Serialising interaction...");

                Query q = QueryFactory.create("" +
                        "prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                        "prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
                        "prefix cvkd: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n" +
                        "prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>\n" +
                        "prefix symbolizer: <https://gis.lu.se/ont/data_portrayal/symbolizer#>\n" +
                        "prefix ion: <http://lig-tdcge.imag.fr/steamer/covikoa/interaction#>\n" +
                        "\n" +
                        "SELECT ?interaction ?event ?endingTypes ?durationInteraction ?analyticalPurpose ?outcome ?typeOutcome ?strategySelectionType ?strategySelectionPropertyPath ?selectionStrategyTargetsEntitiesFrom ?outcomeComponent ?symbolizerPropJson ?modifiers WHERE {\n" +
                        "  BIND(" + formattedIriResource + " as ?interaction)\n" +
                        "  # 0. Event\n" +
                        "  ?interaction ion:isTriggeredBy ?event .\n" +
                        "  # 1. Ending(s) of the interaction\n" +
                        "  {\n" +
                        "     SELECT ?interaction (GROUP_CONCAT(?endingType;separator=',') as ?endingTypes) WHERE {\n" +
                        "         ?interaction ion:hasEnding ?ending .\n" +
                        "         ?ending a ?endingType .\n" +
                        "         FILTER(STRSTARTS(STR(?endingType),str(ion:)))\n" +
                        "     } GROUP BY ?interaction\n" +
                        "  }\n" +
                        "  OPTIONAL { ?interaction ion:hasEnding/ion:seconds ?durationInteraction }\n" +
                        "\n" +
                        "  # 2. Analytical purpose\n" +
                        "  OPTIONAL {\n" +
                        "    ?interaction ion:hasAnalyticalPurpose ?analyticalPurpose .\n" +
                        "  }\n" +
                        "  \n" +
                        "  # 3. Outcomes\n" +
                        "  OPTIONAL {\n" +
                        "    ?interaction ion:hasTargetOutcome|ion:hasRestOutcome ?outcome .\n" +
                        "    ?interaction ?propOutcome ?outcome .\n" +
                        "    BIND(IF(STR(?propOutcome) = STR(ion:hasTargetOutcome), \"target\", \"rest\") as ?typeOutcome)\n" +
                        "    OPTIONAL { ?outcome ion:onComponent ?outcomeComponent . }\n" +
                        "    OPTIONAL {\n" +
                        "      ?outcome ion:hasInteractionSymbolizer ?symbolizer .\n" +
                        "      ?symbolizer gviz:asGeoStylerJSON ?symbolizerPropJson .\n" +
                        "    }\n" +
                        "    OPTIONAL {\n" +
                        "      {\n" +
                        "        SELECT ?outcome (CONCAT('[', GROUP_CONCAT(?mod; separator=','), ']') as ?modifiers) WHERE {" +
                        "          ?outcome ion:hasSymbolizerModifier ?modifier .\n" +
                        "          ?modifier ion:onProperty ?_propertyModified .\n" +
                        "          BIND(cvkd:RewriteShaclPropertyPathToSPARQLPropertyPath(?_propertyModified) as ?propertyModified) \n" +
                        "          ?modifier ion:modifiedValue ?valueModified .\n" +
                        "          BIND(CONCAT('{\"property\":\"', ?propertyModified, '\", \"value\":\"', STR(?valueModified), '\"}') as ?mod)\n" +
                        "        } GROUP BY ?outcome\n" +
                        "      }\n" +
                        "    }\n" +
                        "    OPTIONAL {\n" +
                        "      ?outcome ion:hasOutcomeSelectionStrategy ?strategyselection .\n" +
                        "      ?strategyselection a ?strategySelectionType .\n" +
                        "      FILTER(STRSTARTS(STR(?strategySelectionType),str(ion:)))\n" +
                        "      OPTIONAL {\n" +
                        "        ?strategyselection ion:targetsEntitiesFrom ?selectionStrategyTargetsEntitiesFrom .\n" +
                        "        OPTIONAL {\n" +
                        "          ?strategyselection ion:propertyPath ?pp .\n" +
                        "          BIND(cvkd:RewriteShaclPropertyPathToSPARQLPropertyPath(?pp) as ?strategySelectionPropertyPath) .\n" +
                        "        }\n" +
                        "      }\n" +
                        "    }\n" +
                        "  }\n" +
                        "}");
                QueryExecution qexec = QueryExecutionFactory.create(q, model);
                ResultSet resultSet = qexec.execSelect();

                JSONObject obj = new JSONObject();
                JSONArray outcomes = new JSONArray();
                Integer i = 0;
                while (resultSet.hasNext()) {
                    QuerySolution soln = resultSet.nextSolution();
                    // Prepare info about the interaction
                    if (i.equals(0)) {
                        // IRI of the interaction
                        obj.put("interaction", iriResource);
                        // IRI of the event
                        obj.put("event", soln.get("event").toString());
                        // Ending might be of several types
                        JSONArray endingTypes = new JSONArray();
                        Arrays.stream(soln.getLiteral("endingTypes").toString().split(","))
                                .forEach((String _v) -> { endingTypes.add(_v); });
                        obj.put("ending", endingTypes);
                        // Ending duration is optional
                        if (soln.get("durationInteraction") != null) {
                            obj.put("endingDuration", soln.getLiteral("durationInteraction").getDouble());
                        }
                        // Analytical purpose too
                        if (soln.get("analyticalPurpose") != null) {
                            obj.put("analyticalPurpose", soln.get("analyticalPurpose").toString());
                        }
                    }
                    // Prepare info about the outcome
                    JSONObject thisOutcome = new JSONObject();
                    thisOutcome.put("typeOutcome", soln.getLiteral("typeOutcome").getString());
                    if (soln.get("strategySelectionType") != null) {
                        thisOutcome.put(
                                "selectionStrategyType",
                                soln.get("strategySelectionType").toString());
                    }
                    if (soln.get("strategySelectionPropertyPath") != null) {
                        thisOutcome.put(
                                "selectionStrategyPropertyPath",
                                soln.get("strategySelectionPropertyPath").toString());
                    }
                    if (soln.get("selectionStrategyTargetsEntitiesFrom") != null) {
                        thisOutcome.put(
                                "selectionStrategyTargetsEntitiesFrom",
                                soln.get("selectionStrategyTargetsEntitiesFrom").toString());
                    }
                    if (soln.get("outcomeComponent") != null) {
                        thisOutcome.put("onComponent", soln.get("outcomeComponent").toString());
                    }
                    if (soln.get("symbolizerPropJson") != null) {
                        try {
                            JSONObject symbolizerObj = (JSONObject) new JSONParser()
                                    .parse(soln.getLiteral("symbolizerPropJson").getString());
                            thisOutcome.put("symbolizer", symbolizerObj);
                        } catch (ParseException e) {
                            e.printStackTrace();
                        }
                    }
                    if (soln.get("modifiers") != null) {
                        try {
                            JSONArray symbolizerModifiersObj = (JSONArray) new JSONParser()
                                    .parse(soln.getLiteral("modifiers").getString());
                            thisOutcome.put("symbolizerModifiers", symbolizerModifiersObj);
                        } catch (ParseException e) {
                            e.printStackTrace();
                        }
                    }
                    outcomes.add(thisOutcome);
                }
                obj.put("outcomes", outcomes);

                resultString = obj.toJSONString();
                cache.put(formattedIriResource, resultString);
                Node result = NodeFactory.createLiteral(resultString);
                return IterLib.oneResult(binding, Var.alloc(object), result, execCxt);
            }

            @Override
            public Node calc(Node node) {
                return null;
            }
        };
    }
}
