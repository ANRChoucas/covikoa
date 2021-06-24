import {
  Circle as CircleStyle, RegularShape, Fill, Stroke, Style,
} from 'ol/style';

// Given an Object containing the graphic in geostyler(-like) vocabularie
// transform it to a `Style` object from OpenLayers
const makeStyle = (s) => {
  let inner_style = {};
  const specJSON = JSON.parse(s.specJSON);
  if (s.type === 'PointSymbolizer') {
    if (specJSON.kind === 'Mark') {
      // Fill
      const inner_fill_style = {};
      inner_fill_style.color = specJSON.color;
      inner_style.fill = new Fill(inner_fill_style);
      // Stroke
      const inner_stroke_style = {};
      inner_stroke_style.color = specJSON.strokeColor;
      inner_stroke_style.width = specJSON.strokeWidth;
      // inner_stroke_style.lineDash = specJSON.strokeDashArray;
      // inner_stroke_style.lineDashOffset = specJSON.strokeDashOffset;
      inner_style.stroke = new Stroke(inner_stroke_style);
      // Radius / size:
      inner_style.radius = specJSON.radius;
      if (specJSON.wellKnownName === 'circle') {
        inner_style = { image: new CircleStyle(inner_style) };
      } else if (specJSON.wellKnownName === 'square') {
        inner_style = {
          image: new RegularShape({
            fill: inner_style.fill,
            stroke: inner_style.stroke,
            points: 4,
            radius: 10,
            angle: Math.PI / 4,
          }),
        };
      }
    }
  } else if (s.type === 'LineSymbolizer') {
    const inner_stroke_style = {};
    inner_stroke_style.color = specJSON.color;
    inner_stroke_style.width = specJSON.width;
    inner_stroke_style.lineDash = specJSON.dashArray;
    inner_stroke_style.lineDashOffset = specJSON.dashOffset ? +specJSON.dashOffset : undefined;
    inner_style.stroke = new Stroke(inner_stroke_style);
  } else if (s.type === 'PolygonSymbolizer') {
    inner_style.fill = new Fill({ color: specJSON.color });
    if (specJSON.outlineColor || specJSON.outlineWidth) {
      const inner_stroke_style = {};
      inner_stroke_style.color = specJSON.outlineColor;
      inner_stroke_style.width = specJSON.outlineWidth;
      inner_style.stroke = new Stroke(inner_stroke_style);
    }
  } else {
    throw new Error('TextSymbolizer are not currently supported');
  }
  return new Style(inner_style);
};

export default makeStyle;
