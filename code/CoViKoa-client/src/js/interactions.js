/**
* To store and instanciate the interactions
* that might have been defined in the derivation model
*
*/
import { QUERY_URL } from './consts';
import {
  reqQuery,
  makeQueryDataIndividual,
} from './queries';
import displayPopup from './popup';

export const bindIdentify = (map) => {
  map.on('singleclick', async (e) => {
    const coords = e.coordinate;

    let ft;
    map.forEachFeatureAtPixel(
      e.pixel,
      (feature) => {
        if (ft) return;
        ft = feature;
      },
      {
        hitTolerance: 2,
      },
    );

    if (ft) { // A feature was hit ...
      // Does it allow identify interaction ?
      if (!ft.get('_allowsIdentify')) return;

      if (!ft.get('_hasProperties')) {
        // The feature wasnt already enriched ...
        const id = ft.getId();
        const query = makeQueryDataIndividual(id);
        const queryResult = await reqQuery(QUERY_URL, query);
        const properties = { _hasProperties: true };
        queryResult.results.bindings
          .forEach((d) => { properties[d.p.value] = d.v.value; });
        // Enrich the feature so that a future click doesnt trigger the query again..
        ft.setProperties(properties);
        displayPopup(map, ft, coords);
      } else {
        // Feature was already enriched so we can dsplay the infobox directly
        displayPopup(map, ft, coords);
      }
    }
  });
};

export const bindOtherInteraction = () => null;
