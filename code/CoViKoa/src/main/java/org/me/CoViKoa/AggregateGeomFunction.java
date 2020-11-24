package org.me.CoViKoa;

import org.apache.jena.geosparql.implementation.datatype.WKTDatatype;
import org.apache.jena.sparql.engine.binding.Binding;
import org.apache.jena.sparql.expr.Expr;
import org.apache.jena.sparql.expr.ExprEvalException;
import org.apache.jena.sparql.expr.ExprList;
import org.apache.jena.sparql.expr.NodeValue;
import org.apache.jena.sparql.expr.aggregate.Accumulator ;
import org.apache.jena.sparql.expr.aggregate.AccumulatorFactory ;
import org.apache.jena.sparql.expr.aggregate.AggCustom ;
import org.apache.jena.sparql.function.FunctionEnv ;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryCollection;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTReader;
import org.locationtech.jts.io.WKTWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;

/**
 * Aggregation functions in extensions to GeoSPARQL (expects/returns wktLiteral geometries only).
 * Implements Union, Intersection and Envelope on any set of geometries (using JTS engine).
 *
 * @author Matthieu Viry
 * @version 0.0.1
 */
public class AggregateGeomFunction {
    private final static Logger logger = LoggerFactory.getLogger(AggregateGeomFunction.class);

    static AccumulatorFactory unionAccumulatorFactory = new AccumulatorFactory() {
        @Override
        public Accumulator createAccumulator(AggCustom agg, boolean distinct) { return new UnionAccumulator(agg); }
    };

    static AccumulatorFactory intersectionAccumulatorFactory = new AccumulatorFactory() {
        @Override
        public Accumulator createAccumulator(AggCustom agg, boolean distinct) { return new IntersectionAccumulator(agg); }
    };

    static AccumulatorFactory envelopeAccumulatorFactory = new AccumulatorFactory() {
        @Override
        public Accumulator createAccumulator(AggCustom agg, boolean distinct) { return new EnvelopeAccumulator(agg); }
    };

    private static void collectGeometries(Binding binding, FunctionEnv functionEnv, AggCustom agg, WKTReader wkt, ArrayList<Geometry> geometries) {
        ExprList exprList = agg.getExprList();
        for(Expr expr: exprList) {
            try {
                NodeValue nv = expr.eval(binding, functionEnv);
                if (nv.isLiteral()) {
                    Geometry poly = wkt.read(nv.asString());
                    geometries.add(poly);
                }
            } catch (ExprEvalException ex) {
                ex.printStackTrace();
            } catch (ParseException e) {
                e.printStackTrace();
            }
        }
    }

    static class UnionAccumulator implements Accumulator {
        int count = 0;
        private AggCustom agg;
        WKTReader wkt = new WKTReader();
        GeometryFactory geoFac = new GeometryFactory();
        ArrayList<Geometry> geometries = new ArrayList<>();
        UnionAccumulator(AggCustom agg) { this.agg = agg; }

        @Override
        public void accumulate(Binding binding, FunctionEnv functionEnv) {
            collectGeometries(binding, functionEnv, agg, wkt, geometries);
        }

        @Override
        public NodeValue getValue() {
            GeometryCollection geometryCollection = (GeometryCollection) geoFac.buildGeometry(geometries);
            Geometry result = geometryCollection.union();
            WKTWriter writer = new WKTWriter();
            String s = writer.write(result);
            return NodeValue.makeNode(s, WKTDatatype.INSTANCE);
        }
    }

    static class IntersectionAccumulator implements Accumulator {
        int count = 0;
        private AggCustom agg;
        WKTReader wkt = new WKTReader();
        ArrayList<Geometry> geometries = new ArrayList<>();
        IntersectionAccumulator(AggCustom agg) { this.agg = agg ; }

        @Override
        public void accumulate(Binding binding, FunctionEnv functionEnv) {
            collectGeometries(binding, functionEnv, agg, wkt, geometries);
        }

        @Override
        public NodeValue getValue() {
            Geometry g = geometries.get(0);

            for (int i = 1; i < geometries.size(); i++) {
                Geometry other = geometries.get(i);
                g = g.intersection(other);
            }

            WKTWriter writer = new WKTWriter();
            String s = writer.write(g);
            return NodeValue.makeNode(s, WKTDatatype.INSTANCE);
        }
    }
    static class EnvelopeAccumulator implements Accumulator {
        int count = 0;
        private AggCustom agg;
        WKTReader wkt = new WKTReader();
        GeometryFactory geoFac = new GeometryFactory();
        ArrayList<Geometry> geometries = new ArrayList<>();
        EnvelopeAccumulator(AggCustom agg) { this.agg = agg; }

        @Override
        public void accumulate(Binding binding, FunctionEnv functionEnv) {
            collectGeometries(binding, functionEnv, agg, wkt, geometries);
        }

        @Override
        public NodeValue getValue() {
            Geometry result;
            if (geometries.size() > 1) {
                GeometryCollection geometryCollection = (GeometryCollection) geoFac.buildGeometry(geometries);
                result = geometryCollection.getEnvelope();
            } else {
                result = geometries.get(0).getEnvelope();
            }
            WKTWriter writer = new WKTWriter();
            String s = writer.write(result);
            return NodeValue.makeNode(s, WKTDatatype.INSTANCE);
        }
    }
}
