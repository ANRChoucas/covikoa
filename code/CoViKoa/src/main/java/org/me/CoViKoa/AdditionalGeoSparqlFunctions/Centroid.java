package org.me.CoViKoa.AdditionalGeoSparqlFunctions;

import org.apache.jena.geosparql.implementation.datatype.WKTDatatype;
import org.apache.jena.sparql.expr.NodeValue;
import org.apache.jena.sparql.function.FunctionBase1;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTWriter;
import org.me.CoViKoa.GeometryUtils.WktParser;

public class Centroid extends FunctionBase1 {
    @Override
    public NodeValue exec(NodeValue arg0) {
        WktParser parser = new WktParser();
        try {
            Geometry geom = parser.parseGeometry(arg0.asString());
            Geometry centroid = geom.getCentroid();
            WKTWriter writer = new WKTWriter();
            String s = writer.write(centroid);
            return NodeValue.makeNode(s, WKTDatatype.INSTANCE);
        } catch (ParseException e) {
            e.printStackTrace();
            return NodeValue.nvEmptyString;
        }
    }
}
