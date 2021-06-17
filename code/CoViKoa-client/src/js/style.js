import {
  Circle as CircleStyle, Fill, Stroke, Style, Text,
} from 'ol/style';

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
    throw new Error('TextSymbolizer are not currently supported');
  }
  return new Style(inner_style);
};

export default makeStyle;
