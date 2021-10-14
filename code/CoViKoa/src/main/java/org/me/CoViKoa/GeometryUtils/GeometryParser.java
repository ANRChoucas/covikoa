package org.me.CoViKoa.GeometryUtils;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.ParseException;

public interface GeometryParser {
    public Geometry parseGeometry(String serialisedGeometry) throws ParseException;
}
