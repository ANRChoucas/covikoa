import WKT from 'ol/format/WKT';
import View from 'ol/View';
import {
  reqQuery,
  makeQueryTable,
  makeQueryStaticContentComponent,
} from './queries';
import { QUERY_URL, NS_CONTEXT } from './consts';

/**
 * Shortens an iri (precisely an url) by extracting its prefix and localname
 * so that 'http://example.com/ns#Stuff' (or 'http://example.com/ns/Stuff')
 * becomes 'ns:Stuff'.
 * Iri of type urn are returned unmodified.
 *
 * @param {string} iri - The iri to be shortened
 * @returns {string} The shortened iri
 *
 */
export const makePrefixName = (iri) => {
  if (iri.indexOf('urn:id') > -1) return iri;
  const ix1 = iri.lastIndexOf('#');
  const ix2 = iri.lastIndexOf('/');
  let p1;
  let p2;
  if (ix1 > -1 && ix1 > ix2) {
    p2 = iri.slice(ix1 + 1);
    p1 = iri.slice(ix2 + 1, ix1);
  } else if (ix2 > -1) {
    p2 = iri.slice(ix2 + 1);
    const ix3 = iri.slice(0, ix2).lastIndexOf('/');
    p1 = iri.slice(ix3 + 1, ix2);
  }
  p1 = p1.replace('22-rdf-syntax-ns', 'rdf')
    .replace('rdf-schema', 'rdfs');
  return `${p1}:${p2}`;
};

const reservedProperties = [
  '_hasProperties',
  'geometry',
  '_allowsSingleClick',
  '_allowsMouseOver',
  '_allowsContextMenu',
  '_allowsDoubleClick',
  '_idTargetIndividual',
  '_idIntermediateRepresentation',
];
/**
 * TODO
 *
 * @param {ol.Feature} ft - The OpenLayers Feature to extract properties from
 * @returns {object} the properties in a format that can be read by popup element
 */
export const extractFeatureProperties = (ft) => {
  const properties = ft.getProperties();
  console.log(properties);
  return Object.keys(properties)
    .filter((k) => !(reservedProperties.includes(k)))
    .map((k) => ({
      propertyName: k.startsWith('http') ? makePrefixName(k) : k,
      propertyIRI: k,
      values: properties[k].map((value) => (value.startsWith('http') ? makePrefixName(value) : value)),
      valuesIRIs: properties[k].map((value) => (value.startsWith('http') ? value : null)),
    }));
};

// All the geometries will be fetched in WKT
export const wktFormat = new WKT();

const numericDatatype = new Set([
  'http://www.w3.org/2001/XMLSchema#integer',
  'http://www.w3.org/2001/XMLSchema#int',
  'http://www.w3.org/2001/XMLSchema#long',
  'http://www.w3.org/2001/XMLSchema#short',
  'http://www.w3.org/2001/XMLSchema#double',
  'http://www.w3.org/2001/XMLSchema#decimal',
  'http://www.w3.org/2001/XMLSchema#float',
]);

/**
 * Extract the value from a given 'key' on a given SPARQL
 * query solution ('item') or returns 'defaultValue' if the variable was
 * not bound on this element
 * (see https://www.w3.org/TR/sparql11-results-json/#select-encode-terms
 *  about how are encoded RDF terms in query results in JSON format).
 * Note that values of numeric datatype are casted from string to JS Number.
 *
 * @param {object} item
 * @param {string} key
 * @param {*} defaultValue
 * @returns {null|number|string|*}
 */
export const getValue = (item, key, defaultValue = null) => {
  if (item[key] && item[key].value) {
    return numericDatatype.has(item[key].datatype)
      ? +item[key].value
      : item[key].value;
  }
  return defaultValue;
};

const [A, B, C, D] = [40487.57, 0.00007096758, 91610.74, -40465.7];
/**
* Returns the altitude of the camera given the zoom level of an ol.View.
*
* @param {number} zl - The zoom level
*/
export const altitudeFromZoomLevel = (zl) => C * (((A - D) / (zl - D) - 1) ** (1 / B));

/**
 * Prepare data for static content component.
 * @param {string} iriComponent - The iri (in covikoa graph) of the component
 * @returns {object} The object containing necessary information to instantiate StaticWidget.
 */
export const sparqlQueryToContentWidgetData = async (iriComponent) => {
  const queryContent = makeQueryStaticContentComponent(iriComponent);
  const result = (await reqQuery(QUERY_URL, queryContent)).results.bindings;
  const htmlContent = getValue(result[0], 'htmlContent');
  return {
    iriComponent,
    content: htmlContent,
  };
};

/**
* Prepare data for table component.
*
* @param {string} iriTable - The iri (in covikoa graph) of the table
* @returns {object} The object containing necessary information to instantiate TableWidget.
*/
export const sparqlRequestToTableData = async (iriTable) => {
  const queryTable = makeQueryTable(iriTable);
  const results = (await reqQuery(QUERY_URL, queryTable)).results.bindings;
  if (!results.length) {
    // No table to display
    return null;
  }

  // Information about the table component
  const conceptTargetDataModel = makePrefixName(getValue(results[0], 'conceptTargetDataModel', ''));
  const titleTable = getValue(results[0], 'tableTitle', `Data table for ${conceptTargetDataModel}`);

  // We want to pass from narrow (stacked) dataset (entity-attribute-value model)
  // to a wide (unstacked) dataset.
  const data = [];
  const fieldsSet = new Set(['iri']);

  results.forEach((elem) => {
    const iriIndiv = makePrefixName(getValue(elem, 'indiv'));
    const iriProperty = getValue(elem, 'p');
    const value = getValue(elem, 'v');
    const nameProperty = makePrefixName(iriProperty);
    const existing = data.find((d) => d.iri === iriIndiv);
    if (!fieldsSet.has(nameProperty)) {
      fieldsSet.add(nameProperty);
    }
    if (existing) {
      existing[nameProperty] = value;
    } else {
      data.push({
        iri: iriIndiv,
        [nameProperty]: value,
      });
    }
  });
  const primaryKey = ['iri'];
  const fields = [...fieldsSet]
    .map((elem) => ({ name: elem, type: 'string' })); // TODO: all fields typed as string for now, to be changed

  // Sort dataset by IRI of individual
  data.sort((a, b) => (a.iri > b.iri ? 1 : -1));

  return {
    titleTable, // <- we will use this for our TableWidget
    iriTable, // <- this too
    schemaAndData: { // <- this is the part needed by @lumino/DataGrid inside TableWidget
      data,
      schema: {
        primaryKey,
        fields,
      },
    },
  };
};

/**
* Debounce a function execution.
*
* @param {Function} func - The function to be executed after the debounce time.
* @param {Number} wait - The amount of time to wait after the last
*                         execution and before executing `func`.
* @param {Object} context - Context in which to call `func`.
* @returns {Function} The resulting debounced function.
*/
export function debounce(func, wait, context) {
  let result;
  let timeout = null;
  return function executedFunction(...args) {
    const ctx = context || this;
    const later = () => {
      timeout = null;
      result = func.apply(ctx, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    return result;
  };
}

/**
 * Parse the result of the SPARQL query describing the application and its component.
 *
 * @param resultQueryApplication
 * @returns {{app: {iri: (number|string|*|null), title: (number|string|*|null)}, components: *[]}}
 */
export function responseToApplicationDescription(resultQueryApplication) {
  const components = [];
  resultQueryApplication.forEach((elem) => {
    const o = {
      iri: getValue(elem, 'geovizcomponent'),
      type: getValue(elem, 'typeComponent'),
      title: getValue(elem, 'componentTitle'),
      position: getValue(elem, 'position'),
      indexPosition: getValue(elem, 'order'),
      width: getValue(elem, 'w'),
      height: getValue(elem, 'h'),
      options: {},
    };

    if (elem.geomInitialExtent) {
      o.options.geomInitialExtent = getValue(elem, 'geomInitialExtent');
    }
    if (elem.basemapAttribution) {
      o.options.basemapAttribution = getValue(elem, 'basemapAttribution');
      o.options.basemapTemplateUrl = getValue(elem, 'basemapTemplateUrl');
    }
    if (elem.deactivatedInteractions) {
      const temp = getValue(elem, 'deactivatedInteractions').split(',');
      o.options.deactivatedInteractions = [];
      temp.forEach((param) => {
        const v = param.replace(NS_CONTEXT, '');
        o.options.deactivatedInteractions.push(v);
      });
    }
    if (elem.scaleConstraintMinZoom) {
      const minZoom = getValue(elem, 'scaleConstraintMinZoom');
      const maxZoom = getValue(elem, 'scaleConstraintMaxZoom');
      o.options.constrainedScale = {
        type: 'zoom',
        min: minZoom,
        max: maxZoom,
      };
    } else if (elem.scaleConstraintMinReso) {
      const minReso = getValue(elem, 'scaleConstraintMinReso');
      const maxReso = getValue(elem, 'scaleConstraintMaxReso');
      o.options.constrainedScale = {
        type: 'scaleDenominator',
        min: minReso,
        max: maxReso,
      };
    }
    if (elem.otherGvc) {
      const others = getValue(elem, 'otherGvc');
      o.linkedTo = others.split(';');
    }
    components.push(o);
  });

  // We will sort the components if an order (cvkc:order) is defined in the Derivation Model
  return {
    app: {
      iri: getValue(resultQueryApplication[0], 'app'),
      title: getValue(resultQueryApplication[0], 'appTitle', undefined),
    },
    components: components.every((c) => c.indexPosition !== null)
      ? components.sort((a, b) => a.indexPosition - b.indexPosition)
      : components,
  };
}

/**
 * TODO
 * @param idMaterialisation - The ID (we use its IRI from the graph) of a materialisation.
 * @returns {{feature, mapWidget}} - Object containing the ol.Feature with 'idMaterialisation' as ID
 *                                    and the MapWidget on which it appears.
 */
export const getCorrespondingFeatureOnAnyMapOrTerrain = (idMaterialisation) => {
  let feature;
  let mapWidget;
  global.State.maps.concat(global.State.terrains)
    .forEach((widget) => {
      if (widget.materialisationMapping[idMaterialisation]) {
        feature = widget.materialisationMapping[idMaterialisation];
        mapWidget = widget;
      }
    });
  return { feature, mapWidget };
};

/**
 * TODO
 * @param {string} prefix
 * @returns {string}
 */
export const randomString = (prefix) => Math.random()
  .toString(36).replace('0.', prefix || '');
