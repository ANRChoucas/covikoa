package org.me.CoViKoa.GeometryUtils;

import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTReader;

public class WktParser implements GeometryParser {
    WKTReader wkt = new WKTReader();
    public Geometry parseGeometry(String serialisedGeometry) throws ParseException {
        // Remove the srid information (if in EWKT format) so that JTS can read it
        if (serialisedGeometry.startsWith("SRID")) {
            int index = serialisedGeometry.indexOf(';');
            if (index >= 0 && index + 1 < serialisedGeometry.length()) {
                serialisedGeometry = serialisedGeometry.substring(index + 1);
            }
        }

        // Remove the srid information so that JTS can read it
        if (serialisedGeometry.startsWith("<http")) {
            int index = serialisedGeometry.indexOf('>');
            if (index >= 0 && index + 1 < serialisedGeometry.length()) {
                serialisedGeometry = serialisedGeometry.substring(index + 1);
            }
        }
        // Parse the Geometry
        Geometry geometry = wkt.read(serialisedGeometry);
        return geometry;
    }
}
