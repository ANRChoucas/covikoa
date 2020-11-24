package org.me.CoViKoa;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;
import org.apache.jena.util.FileUtils;
import org.slf4j.Logger;

import java.io.*;

public class Utils {
    static void warnWithModel(Model m, Logger logger) {
        StringWriter stringWriter = new StringWriter();
        m.write(stringWriter, FileUtils.langTurtle);
        logger.warn(stringWriter.toString());
    }

    static void saveModel(Model m, String outputPath) throws IOException {
        File outputFile = new File(outputPath);
        outputFile.createNewFile();
        OutputStream fileOutputString = new FileOutputStream(outputFile);
        RDFDataMgr.write(fileOutputString, m, RDFFormat.TTL);
    }
}