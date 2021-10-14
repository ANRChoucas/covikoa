import { getValue } from '../helpers';
import { NS_SYMBOLIZER } from '../consts';
import { getZoomLevelFromScale } from './map';

export const buildPortrayalsArray = (res_list) => {
  const portrayals = [];

  // Extract reference to each portrayalRule (this is the id of a bnode but we dont care)
  const portrayalRules = new Set(res_list.map((e) => e.portrayalRule.value));

  // Actually build the `portrayals` array, one item for each PortrayalRule
  // The portrayals Array will also be used if a legend is requested ...
  portrayalRules.forEach((ruleId) => {
    const res_item = {
      iriPortrayal: null,
      iriPortrayalRule: null,
      labelPortrayal: null,
      geometries: [],
      idsIntermediateRepresentation: [],
      idsIndiv: [],
      materialisations: [],
      interactionEvents: {},
      symbolizer: null, // One symbolizer object for all the group
      symbolizers: [], // .. or an array of symbolizers, in same order than geoms/ids/etc.
    };

    const groupFeatures = res_list.filter((e) => e.portrayalRule.value === ruleId);
    // Maybe only one group or maybe multiple
    // (depending on if the feature share a symbolizer, such as for a choropleth map,
    //  or not, such as for a Proportionnal symbol map)
    if (groupFeatures.length === 1) {
      const group = groupFeatures[0];
      console.log(group);
      const displayIndex = getValue(group, 'displayIndex', null);
      const minValidScale = getValue(group, 'minScale', null);
      const maxValidScale = getValue(group, 'maxScale', null);
      const minValidZoomLevel = getValue(group, 'minZoomLevel', null);
      const maxValidZoomLevel = getValue(group, 'maxZoomLevel', null);

      const geoms = group.geoms.value.split(';');
      const nbFeature = geoms.length;
      // All the geometries for this group of features inside this portrayalRule
      res_item.geometries.push(...geoms);
      // Ids of the intermediate representation
      res_item.idsIntermediateRepresentation.push(...group.gvrs.value.split(';'));
      // Ids of the actual individual
      res_item.idsIndiv.push(...group.indivs.value.split(';'));
      // Ids of the materialisation
      res_item.materialisations.push(...group.materialisations.value.split(';'));

      // Some metadata
      res_item.iriPortrayal = getValue(group, 'portrayal', null);
      res_item.labelPortrayal = getValue(group, 'labelPortrayal', null);
      res_item.iriPortrayalRule = ruleId;

      // Compute the z-index from the displayIndex if any
      if (displayIndex) {
        res_item.zIndex = 1001 - +displayIndex;
      }

      // Handle the scale value if any
      if (minValidZoomLevel !== null && maxValidZoomLevel !== null) {
        res_item.scaleRange = [minValidZoomLevel, maxValidZoomLevel];
      } else if (minValidScale !== null && maxValidScale !== null) {
        res_item.scaleRange = [
          getZoomLevelFromScale(minValidScale),
          getZoomLevelFromScale(maxValidScale),
        ];
      }

      // Each feature or group of feature can now be matched with its symboliser
      // (which describes the graphic properties to use: fill, stroke, etc.)
      const nameSymbolizer = group.symbolizer.value;
      const type_symbolizer = group.typeSymbolizer.value
        .replace(NS_SYMBOLIZER, '');

      const hasInteraction = getValue(group, 'interaction', false);
      if (hasInteraction) {
        const interactions = JSON.parse(hasInteraction);
        interactions.forEach((interaction) => {
          res_item.interactionEvents[interaction.event] = interaction.interaction;
          // eslint-disable-next-line no-param-reassign
          interaction['onPortrayal'] = res_item.iriPortrayal;
          // Store the interaction
          global.State.interactions[interaction.interaction] = interaction;
        });
      }
      res_item.symbolizer = {
        type: type_symbolizer,
        name: nameSymbolizer,
        specJSON: group.propJson.value,
      };
    } else {
      groupFeatures.forEach((group) => {
        const displayIndex = getValue(group, 'displayIndex', null);
        const minValidScale = getValue(group, 'minScale', null);
        const maxValidScale = getValue(group, 'maxScale', null);
        const minValidZoomLevel = getValue(group, 'minZoomLevel', null);
        const maxValidZoomLevel = getValue(group, 'maxZoomLevel', null);

        const geoms = group.geoms.value.split(';');
        const nbFeature = geoms.length;
        // All the geometries for this group of features inside this portrayalRule
        res_item.geometries.push(...geoms);
        // Ids of the intermediate representation
        res_item.idsIntermediateRepresentation.push(...group.gvrs.value.split(';'));
        // Ids of the actual individual
        res_item.idsIndiv.push(...group.indivs.value.split(';'));
        // Ids of the materialisation
        res_item.materialisations.push(...group.materialisations.value.split(';'));

        // Some metadata
        res_item.iriPortrayal = getValue(group, 'portrayal', null);
        res_item.labelPortrayal = getValue(group, 'labelPortrayal', null);
        res_item.iriPortrayalRule = ruleId;

        // Compute the z-index from the displayIndex if any
        if (displayIndex) {
          res_item.zIndex = 1001 - +displayIndex;
        }

        // Handle the scale value if any
        if (minValidZoomLevel !== null && maxValidZoomLevel !== null) {
          res_item.scaleRange = [minValidZoomLevel, maxValidZoomLevel];
        } else if (minValidScale !== null && maxValidScale !== null) {
          res_item.scaleRange = [
            getZoomLevelFromScale(minValidScale),
            getZoomLevelFromScale(maxValidScale),
          ];
        }

        // Each feature or group of feature can now be matched with its symboliser
        // (which describes the graphic properties to use: fill, stroke, etc.)
        const nameSymbolizer = group.symbolizer.value;
        const type_symbolizer = group.typeSymbolizer.value
          .replace(NS_SYMBOLIZER, '');

        const hasInteraction = getValue(group, 'interaction', false);
        if (hasInteraction) {
          const interactions = JSON.parse(hasInteraction);
          interactions.forEach((interaction) => {
            res_item.interactionEvents[interaction.event] = interaction.interaction;
            // eslint-disable-next-line no-param-reassign
            interaction['onPortrayal'] = res_item.iriPortrayal;
            // TODO: store these interaction at the level of the component
            //         (so we might need to handle that latter in the code)
            global.State.interactions[interaction.interaction] = interaction;
          });
        }

        for (let i = 0; i < nbFeature; i++) {
          res_item.symbolizers.push({
            type: type_symbolizer,
            name: nameSymbolizer,
            specJSON: group.propJson.value,
          });
        }
      });
    }
    portrayals.push(res_item);
  });
  return portrayals;
};
