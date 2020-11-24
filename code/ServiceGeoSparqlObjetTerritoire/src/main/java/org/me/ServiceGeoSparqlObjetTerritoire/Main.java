package org.me.ServiceGeoSparqlObjetTerritoire;

import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.fuseki.system.FusekiLogging;
import org.apache.jena.geosparql.configuration.GeoSPARQLConfig;
import org.apache.jena.geosparql.configuration.GeoSPARQLOperations;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;
import org.apache.jena.util.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;

public class Main {
    private static final Logger logger = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) throws FileNotFoundException {
        String modelPath = args[0]; // TODO: ..
        String dataPath = args[1];
        // Seems needed when used from the compiled jar with dependencies
        org.apache.jena.query.ARQ.init();
        // Init GeoSPARQL memory index
        GeoSPARQLConfig.setupMemoryIndex();
        // OWL_MEM_MICRO_RULE_INF should be enough for what we are using in OWL :
        final Model m = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM_MICRO_RULE_INF);
        m.read(
                new FileInputStream(modelPath),
                null,
                FileUtils.langTurtle);
        m.read(
                new FileInputStream(dataPath),
                null,
                FileUtils.langTurtle);

        // RDFS inferencing of geosparql schema
        GeoSPARQLOperations.applyInferencing(m);

        // Allows to use the query rewrite extension
        // GeoSPARQLOperations.applyDefaultGeometry(m);

        final Dataset ds = DatasetFactory.create(m);
        FusekiLogging.setLogging();
        FusekiServer server = FusekiServer.create()
                .add("/ds", ds, true)
                .build();
        server.start();
        //server.stop();
    }
}
