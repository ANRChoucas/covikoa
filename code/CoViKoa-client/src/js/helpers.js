import WKT from 'ol/format/WKT';

/**
 *
 *
 *
 *
 */
export const extractFeatureProperties = (ft) => {
  const properties = ft.getProperties();
  const newProperties = Object.keys(properties)
    .filter((k) => !(['_hasProperties', 'geometry', '_allowsIdentify'].includes(k)))
    .map((k) => {
      const d = {
        propertyName: k.startsWith('http') ? makePropertyName(k) : k,
        propertyIRI: k,
        value: properties[k],
      };
      return d;
    });
  return newProperties;
};

const makePropertyName = (name) => {
  let newName;
  const ix1 = name.lastIndexOf('#');
  const ix2 = name.lastIndexOf('/');
  if (ix1 > -1 && ix1 > ix2) {
    newName = name.slice(ix1 + 1);
  } else if (ix2 > -1) {
    newName = name.slice(ix2 + 1);
  }
  return newName;
};

// All the geometries will be fetched in WKT
export const wktFormat = new WKT();

export const getValue = (item, key, defaultValue = null) => (
  item[key] && item[key].value ? item[key].value : defaultValue);

export const getResoFromScale = (z, max_resolution = 40075016.68557849 / 256) => (
  max_resolution / (2 ** z));
