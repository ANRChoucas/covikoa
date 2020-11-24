import '../css/styles.css';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Attribution from 'ol/control/Attribution';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, XYZ } from 'ol/source';
import {
  Circle as CircleStyle, Fill, Stroke, Style, Text,
} from 'ol/style';
import WKT from 'ol/format/WKT';
import { reqQuery, queryContextGVA, makeQueryPortrayal } from './queries';

// We declare a few constants, from the URL of the endpoint
// to the namespaces that we're going to handle in JS code
const QUERY_URL = `${window.location.origin}/CoViKoa/query`;
const UPDATE_URL = `${window.location.origin}/CoViKoa/update`;

const NS_SYMBOLIZER = 'https://gis.lu.se/ont/data_portrayal/symbolizer#';
const NS_GRAPHIC = 'https://gis.lu.se/ont/data_portrayal/graphic#';

const ONE_FEATURE_PER_LAYER = Symbol('ONE_FEATURE_PER_LAYER');
const ONE_SYMBOLISER_PER_LAYER = Symbol('ONE_SYMBOLISER_PER_LAYER');

const strategy = ONE_SYMBOLISER_PER_LAYER;

// All the geometries will be fetched in WKT
const wktFormat = new WKT();
const getValue = (item, key, defaultValue = null) => (
  item[key] && item[key].value ? item[key].value : defaultValue);
const getResoFromScale = (z, max_resolution = 40075016.68557849 / 256) => (
  max_resolution / (2 ** z));

const makeMapElement = (map_param) => {
  const mapElement = document.createElement('div');
  mapElement.className = 'ol-map';
  if (map_param.w && map_param.w.value) {
    mapElement.style.width = `${map_param.w.value}px`;
  }
  if (map_param.h && map_param.h.value) {
    mapElement.style.height = `${map_param.h.value}px`;
  }
  document.body.appendChild(mapElement);

  const view = new View({
    center: [0, 0],
    zoom: 3,
  });

  // Compute the zoom and the center from `map_param.geomInitialExtent.value`,
  // if existing, which is the expected WKT extent .
  if (map_param.geomInitialExtent && map_param.geomInitialExtent.value) {
    const feature = wktFormat.readFeature(map_param.geomInitialExtent.value, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    const geom = feature.getGeometry();
    view.fit(geom);
  }

  return new Map({
    layers: [
      new TileLayer({
        source: new XYZ({
          url: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
          attributions: ['© OpenStreetMap -Mitwirkende, SRTM | Affichage de la carte: © OpenTopoMap (CC-BY-SA)'],
        }),
      }),
    ],
    target: mapElement,
    view,
  });
};

// Given an Object containing the graphic properties
// in Symbolizer/Graphic vocabularies, transform it to
// a `Style` object from OpenLayers
const makeStyle = (s) => {
  const keys = Object.keys(s);
  let inner_style = {};
  if (['PointSymbolizer', 'LineSymbolizer', 'PolygonSymbolizer'].indexOf(s.type) > -1) {
    keys.forEach((k) => {
      if (k === 'Fill') {
        const fill_props = Object.keys(s[k]);
        const inner_fill_style = {};
        fill_props.forEach((p) => {
          if (p === 'fillColor') {
            inner_fill_style.color = s[k][p];
          }
        });
        inner_style.fill = new Fill(inner_fill_style);
      } else if (k === 'Stroke') {
        const stroke_props = Object.keys(s[k]);
        const inner_stroke_style = {};
        stroke_props.forEach((p) => {
          if (p === 'strokeColor') {
            inner_stroke_style.color = s[k][p];
          } else if (p === 'strokeWidth') {
            inner_stroke_style.width = s[k][p];
          } else if (p === 'strokeDashArray') {
            inner_stroke_style.lineDash = s[k][p].split(' ').map((d) => +d);
          } else if (p === 'strokeDashOffset') {
            inner_stroke_style.lineDashOffset = +s[k][p];
          } else if (p === 'strokeLineCap') {
            const value = s[k][p];
            if (['butt', 'round', 'square'].indexOf(value) > -1) {
              inner_stroke_style.lineCap = value;
            }
          } else if (p === 'strokeLineJoin') {
            const value = s[k][p];
            if (['bevel', 'round', 'miter'].indexOf(value) > -1) {
              inner_stroke_style.lineCap = value;
            }
          }
        });
        inner_style.stroke = new Stroke(inner_stroke_style);
      }
    });
    // Handle the shape expected for PointSymbolizer (only Circle for now)
    if (keys.some((el) => el === 'Shape') && keys.some((el) => el === 'Circle')) {
      inner_style.radius = s.Circle.radius;
      inner_style = { image: new CircleStyle(inner_style) };
    }
  } else {
    throw new Error('LineSymbolizer are not currently supported');
  }
  return new Style(inner_style);
};

const onload = async () => {
  // Get information about the "GeoVisualApplication" and its component in the KB
  // in order to create them
  const gva_context_results = await reqQuery(QUERY_URL, queryContextGVA);
  const map = makeMapElement(gva_context_results.results.bindings[0]);

  // Get informations about the GeoVisualIntermediateRepresentation in the KB
  const gvr_results = await reqQuery(
    QUERY_URL,
    makeQueryPortrayal(gva_context_results.results.bindings[0].geovizcomponent.value),
  );

  const res_list = gvr_results.results.bindings;
  // We want to build an array containing all the necessary informations
  // to create the corresponding OL VectorLayers
  const portrayals = [];

  if (strategy === ONE_FEATURE_PER_LAYER) {
    // We compute the set of unique portrayals based on
    // the ID of the Intermediate Representation (gviz:GeoVisualIntermediateRepresentation)
    // and the ID of the gviz:PortrayalOption
    // because each individuals might have one or more gviz:PortrayalOption
    // (and these gviz:PortrayalOption might describe a different geo:Geometry
    // to be used depending on the scale of validity of the gviz:PortrayalOption).
    const portrayal_uniques = new Set(res_list.map((d) => [d.gvr.value, d.p.value].join('|')));

    // Actually build the `portrayals` array
    portrayal_uniques.forEach((v) => {
      const [item, portrayalId] = v.split('|');
      const this_portrayal = res_list.filter(
        (d) => (d.gvr.value === item && d.p.value === portrayalId),
      );

      const res_item = { geometry: this_portrayal[0].geom.value };
      // Compute the z-index from the displayIndex
      if (this_portrayal[0].displayIndex) {
        res_item.zIndex = 1001 - +this_portrayal[0].displayIndex.value;
      }
      // Handle the scale value if any
      if (this_portrayal[0].minScale && this_portrayal[0].maxScale) {
        res_item.scaleRange = [
          +this_portrayal[0].minScale.value,
          +this_portrayal[0].maxScale.value,
        ];
      }
      // Each portrayal can now be matched with its symboliser
      // (which describes the graphic properties to use: fill, stroke, etc.)
      const symbz = this_portrayal[0].typeSymbolizer.value;
      const type_portrayal = this_portrayal[0].o.value;
      const type_symbolizer = symbz.replace(NS_SYMBOLIZER, '');

      res_item[type_portrayal] = { type: type_symbolizer };

      this_portrayal.forEach((el) => {
        const style_prop_iri = el.whatProp.value;
        const style_prop_name = style_prop_iri.replace(NS_GRAPHIC, '');
        res_item[type_portrayal][style_prop_name] = {};
        this_portrayal.filter((d) => d.whatProp.value === style_prop_iri).forEach((r) => {
          const prop_iri = r.prop2.value;
          const prop_name = prop_iri.replace(NS_GRAPHIC, '');
          res_item[type_portrayal][style_prop_name][prop_name] = r.value.value;
        });
      });
      portrayals.push(res_item);
    });

    // Create the VectorLayer for each for these portrayal,
    // taking care of activating it's style
    // for the valid scale range
    portrayals.forEach((portr) => {
      const k_styles = Object.keys(portr).filter((e) => e.indexOf('Symbolizer') > -1);
      k_styles.forEach((k_style) => {
        const feature = wktFormat.readFeature(portr.geometry, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        });
        const styleLayer = makeStyle(portr[k_style]);
        const styleValue = portr.scaleRange === undefined
          ? styleLayer
          : (ft, reso) => {
            if (
              reso < getResoFromScale(portr.scaleRange[0])
              && reso > getResoFromScale(portr.scaleRange[1])
            ) {
              return styleLayer;
            }
            return null;
          };

        const layer = new VectorLayer({
          source: new VectorSource({
            features: [feature],
          }),
          style: styleValue,
        });

        if (portr.zIndex) {
          layer.setZIndex(portr.zIndex);
        }
        map.addLayer(layer);
      });
    });
  } else if (strategy === ONE_SYMBOLISER_PER_LAYER) {
    // We compute the set of unique symbolizer at a given scale
    const portrayal_uniques = new Set(
      res_list.map((d) => [
        d.o.value,
        getValue(d, 'minScale', ''),
        getValue(d, 'maxScale', ''),
        getValue(d, 'displayIndex', ''),
      ].join('|')),
    );
    // Actually build the `portrayals` array
    portrayal_uniques.forEach((v) => {
      let [symbolizerId, minValidScale, maxValidScale, displayIndex] = v.split('|');
      if (minValidScale === '' && maxValidScale === '') {
        minValidScale = null;
        maxValidScale = null;
      }
      if (displayIndex === '') {
        displayIndex = null;
      }
      const this_portrayal = res_list.filter(
        (d) => (d.o.value === symbolizerId
          && getValue(d, 'minScale') === minValidScale
          && getValue(d, 'maxScale') === maxValidScale
          && getValue(d, 'displayIndex') === displayIndex),
      );

      const res_item = {};
      // All the geometries for this portrayal
      res_item.geometries = [...new Set(this_portrayal.map((d) => d.geom.value))];

      // Compute the z-index from the displayIndex if any
      if (displayIndex) {
        res_item.zIndex = 1001 - +displayIndex;
      }

      // Handle the scale value if any
      if (minValidScale && maxValidScale) {
        res_item.scaleRange = [+minValidScale, +maxValidScale];
      }
      // Each portrayal can now be matched with its symboliser
      // (which describes the graphic properties to use: fill, stroke, etc.)
      const namePortrayal = this_portrayal[0].o.value;
      const type_symbolizer = this_portrayal[0].typeSymbolizer.value
        .replace(NS_SYMBOLIZER, '');

      res_item[namePortrayal] = { type: type_symbolizer };

      this_portrayal.forEach((el) => {
        const style_prop_iri = el.whatProp.value;
        const style_prop_name = style_prop_iri.replace(NS_GRAPHIC, '');
        res_item[namePortrayal][style_prop_name] = {};
        this_portrayal.filter((d) => d.whatProp.value === style_prop_iri).forEach((r) => {
          const prop_iri = r.prop2.value;
          const prop_name = prop_iri.replace(NS_GRAPHIC, '');
          res_item[namePortrayal][style_prop_name][prop_name] = r.value.value;
        });
      });
      portrayals.push(res_item);
    });
    portrayals.forEach((portr) => {
      const k_styles = Object.keys(portr).filter((e) => e.indexOf('Symbolizer') > -1);
      k_styles.forEach((k_style) => {
        const features = portr.geometries.map((geom) => wktFormat.readFeature(geom, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        }));
        const styleLayer = makeStyle(portr[k_style]);
        const style = portr.scaleRange === undefined
          ? styleLayer
          : (ft, reso) => {
            if (
              reso < getResoFromScale(portr.scaleRange[0])
              && reso > getResoFromScale(portr.scaleRange[1])
            ) {
              return styleLayer;
            }
            return null;
          };

        const layer = new VectorLayer({
          source: new VectorSource({ features }),
          style,
        });

        if (portr.zIndex) {
          layer.setZIndex(portr.zIndex);
        }
        map.addLayer(layer);
      });
    });
  }
  console.log(gva_context_results, gvr_results, portrayals, map);
};

window.onload = onload;
