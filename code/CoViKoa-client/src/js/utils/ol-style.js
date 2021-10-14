import {
  Circle as CircleStyle, Text,
  RegularShape, Fill, Stroke, Style, Icon,
} from 'ol/style';
import { getResolutionFromZoomLevel } from './map';

export const noStyle = new Style({
  fill: new Fill({ color: 'rgba(0,0,0,0)' }),
  stroke: new Stroke({ color: 'rgba(0,0,0,0)' }),
});

/**
 * Given an Object containing the graphic in geostyler(-like) vocabulary,
 * build the corresponding style object.
 *
 * @param {object} s - An object containing a description of a symbolizer
 * @returns {ol.style.Style} The corresponding openlayers style
 */
export const makeStyle = (s) => {
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
      } else if (specJSON.wellKnownName === 'square') { // TODO : add the other shapes
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
    } else if (specJSON.kind === 'Icon') {
      inner_style.image = new Icon({
        src: specJSON.image,
        size: specJSON.size,
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
      });
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
  } else if (s.type === 'TextSymbolizer') {
    // Build the value for 'font' field
    const font = specJSON.font ? specJSON.font[0] : 'Arial, Verdana, Helvetica, sans-serif';
    const weight = specJSON.weight ? specJSON.weight : 'normal';
    const size = specJSON.size ? `${specJSON.size}px` : '12px';
    const fontValue = [weight, size, font].join(' ');

    // Build the value for 'fill' field
    const fillValue = specJSON.color
      ? new Fill({ color: specJSON.color })
      : undefined;

    // Build the value for 'stroke' field
    const outlineColor = specJSON.haloColor;
    const outlineWidth = specJSON.haloWidth;
    const strokeValue = (outlineColor && outlineWidth)
      ? new Stroke({ color: outlineColor, width: outlineWidth })
      : undefined;
    inner_style.text = new Text({
      font: fontValue,
      fill: fillValue,
      text: specJSON.label,
      stroke: strokeValue,
    });
  } else {
    throw new Error('CompositeSymbolizer are not currently supported');
  }

  return new Style(inner_style);
};

/**
 * Given an Object containing the graphic in geostyler(-like) vocabulary
 * and a range of zoom level validity, build the corresponding style object or function.
 *
 * @param {object} symbolizer - An object containing a description of a symbolizer
 * @param {number[]} scaleRange - An array containing the range of validity of the symbolizer
 *                             (expressed in zoom level, like [1, 8])
 * @returns {ol.style.Style | function} The corresponding openlayers style function or style object
 */
export const makeStyleFnOrStyleObject = (symbolizer, scaleRange) => {
  const styleObject = makeStyle(symbolizer);
  return (scaleRange === undefined)
    ? styleObject
    : (ft, resolution) => {
      if (
        resolution < getResolutionFromZoomLevel(scaleRange[0]) // TODO: use the Ol.view builtin function
        && resolution > getResolutionFromZoomLevel(scaleRange[1]) // that allows to do that
      ) {
        return styleObject;
      }
      return null;
    };
};

/**
 * Compute the new ol Style based on an array of modifiers (ion:hasSymbolizerModifier).
 *
 * @param {ol.style.Style} oldStyle - The style to be modified
 * @param {string} typeGeom - The type of the geometry
 * @param {object[]} modifiers - Array of modifiers (object with 'value' and 'property' keys)
 * @returns {ol.style.Style}
 */
export const getModifiedOlStyle = (oldStyle, typeGeom, modifiers) => {
  const newStyle = oldStyle.clone();
  modifiers.forEach(({ property, value }) => {
    // TODO many more cases to be handled
    if (typeGeom.indexOf('Polygon') > -1 || typeGeom.indexOf('Line')) {
      if (property.indexOf('strokeColor') > -1) {
        newStyle.getStroke().setColor(value);
      } else if (property.indexOf('strokeWidth') > -1) {
        newStyle.getStroke().setWidth(value);
      } else if (property.indexOf('fillColor') > -1) {
        newStyle.getFill().setColor(value);
      }
    }
  });
  return newStyle;
};
