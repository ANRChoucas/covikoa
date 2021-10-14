/**
 *
 * @param {object} symbolizer
 * @returns {object}
 */
export const makeStyle = (symbolizer) => {
  const style = {};
  if (symbolizer.kind === 'Line') {
    style.strokeColor = symbolizer.color;
    style.strokeWidth = symbolizer.width;
  } else if (symbolizer.kind === 'Fill') {
    style.lineColor = symbolizer.outlineColor;
    style.lineWidth = symbolizer.outlineWidth;
    style.fillColor = symbolizer.color;
  }
  return style;
};

/**
 * Convert a rgb/rgba css color value to an array of four components (r, g, b and a),
 * with possibly r, g and b normalized between 0 and 1.
 *
 * @param rgbaString - The color value as rgb or rgba.
 * @param normalize - Whether to normalize the value between 0-1.
 * @returns {number[]} An array of four numerical values (r, g, b and a).
 */
export const parseRgbaColor = (rgbaString, normalize = true) => {
  // Input string is expected to strart with "rgb" or "rgba"
  if (!rgbaString.startsWith('rgb')) throw new Error('Error parsing rgb/rgba string');
  // Match all the numerical value and cast them to number
  let arr = rgbaString.match(/[.\d]+/g).map((a) => +a);
  // 3 or 4 values are expected
  if (arr.length < 3 || arr.length > 4) throw new Error('Error parsing rgb/rgba string');
  if (normalize) {
    arr = [].concat(
      arr.slice(0, 3).map((c) => c / 255),
      arr.slice(3, 4),
    );
  }
  if (arr.length === 3) {
    arr.push(1);
  }
  return arr;
};

/**
 *
 * @param {String} rgbaString - The rgb(a) string to parse and transform to an object
 * @returns {{w: number, x: number, y: number, z: number}} - The color description on a format
 *                                                   suitable for openglobus colors
 *                                                   setter postfixed with 4v (setFillColor4v, etc.)
 */
export const parseRgbaColor4v = (rgbaString) => {
  const rgbaArray = parseRgbaColor(rgbaString);
  return {
    x: rgbaArray[0],
    y: rgbaArray[1],
    z: rgbaArray[2],
    w: rgbaArray[3],
  };
};

// export const getModifiedOgStyle = (oldStyle, typeGeom, modifiers) => {
//
//   modifiers.forEach(({ property, value }) => {
//     if (typeGeom.indexOf('Polygon') > -1 || typeGeom.indexOf('Line')) {
//       if (property.indexOf('strokeColor') > -1) {
//         newStyle.getStroke().setColor(value);
//       } else if (property.indexOf('strokeWidth') > -1) {
//         newStyle.getStroke().setWidth(value);
//       } else if (property.indexOf('fillColor') > -1) {
//         newStyle.getFill().setColor(value);
//       }
//     }
//   });
//   return newStyle;
// };
