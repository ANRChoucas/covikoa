import '../css/styles.css';
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import { QUERY_URL } from './consts';
import { bindIdentify } from './interactions';
import {
  reqQuery,
  queryContextGVA,
  makeQueryLegend,
  makeQueryPortrayal,
} from './queries';
import makeLegend from './legend';
import { makeMapElement, makeLayerAndPortrayal, handleMapSynchronisation } from './map';

global.State = {};

const onload = async () => {
  // Get information about the "GeoVisualApplication" and its component in the KB
  // in order to create them
  const gva_context_results = (
    await reqQuery(QUERY_URL, queryContextGVA)).results.bindings;

  // Maybe there is multiple map so we build an array of them ...
  global.State.maps = gva_context_results.map((result) => makeMapElement(result));

  // Handle synchronisation between maps...
  handleMapSynchronisation(global.State.maps, gva_context_results);

  global.State.maps.forEach(async (map) => {
    // The iri of this map
    const iriMap = map.getTarget().getAttribute('iri');

    // Get informations about the GeoVisualIntermediateRepresentation in the KB
    // regarding this map
    const gvr_results = (
      await reqQuery(QUERY_URL, makeQueryPortrayal(iriMap))).results.bindings;

    const portrayals = makeLayerAndPortrayal(gvr_results, map);

    console.log(gva_context_results, gvr_results, portrayals, map);

    // Do we need to build a legend ?
    const result_legend = (
      await reqQuery(QUERY_URL, makeQueryLegend(iriMap))).results.bindings;

    if (result_legend.length) {
      // There is a legend linked to this map
      makeLegend(map, gvr_results, portrayals);
    }

    // Bind it anyway, the fact that it allows identify is verified later
    bindIdentify(map);
  });
};

window.onload = onload;
