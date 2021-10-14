import { layer } from '@openglobus/og';
import parse from 'wellknown';
import Entity from './terrain-entity';
import { makeStyle } from './og-style';
import { buildPortrayalsArray } from './portrayalConversion';

const { Vector } = layer;

const makePropertiesForInteractions = (interactionEvents, idTargetIndividual, idIR) => {
  const props = {};
  [
    ['http://lig-tdcge.imag.fr/steamer/covikoa/interaction#singleClick', '_allowsSingleClick'],
    ['http://lig-tdcge.imag.fr/steamer/covikoa/interaction#mouseOver', '_allowsMouseOver'],
    ['http://lig-tdcge.imag.fr/steamer/covikoa/interaction#doubleClick', '_allowsDoubleClick'],
    ['http://lig-tdcge.imag.fr/steamer/covikoa/interaction#contextMenu', '_allowsContextMenu'],
  ].forEach(([eventType, propName]) => {
    if (interactionEvents[eventType]) props[propName] = interactionEvents[eventType];
    else props[propName] = '';
  });
  props._idTargetIndividual = idTargetIndividual;
  props._idIntermediateRepresentation = idIR;
  return props;
};

export const makeTerrainLayersAndPortrayals = (res_list, terrainWidget) => {
  const portrayals = buildPortrayalsArray(res_list);

  // The idea is to have, for each component, a mapping
  // idMaterialisation -> feature
  // so that we can quickly get the feature / entity
  // to be modified when an interaction needs it
  // (we use the same mechanism on MapWidget).
  const materialisationMapping = {};

  portrayals.forEach((portr) => {
    // TODO: use a better layer name (and use the same scheme for naming ol.Layers
    const nameLayer = portr.iriPortrayal + portr.iriPortrayalRule;
    const ogLayer = new Vector(nameLayer, {
      visibility: true,
      isBaseLayer: false,
      pickingEnabled: true,
      clampToGround: true,
      ambient: [1, 1, 1], // TODO: we should improve these values
      diffuse: [0, 0, 0],
    });
    portr.geometries.forEach((geomWkt, i) => {
      // Make the style from the description of the symbolizer
      const symbolizer = portr.symbolizer || portr.symbolizers[i];
      const style = makeStyle(JSON.parse(symbolizer.specJSON));
      // Make the geometry in geojson format (from the wkt retrieved)
      const geomJson = parse(geomWkt.replace('<http://www.opengis.net/def/crs/EPSG/0/4326> ', ''));
      geomJson.style = style;
      // Make the property object
      const properties = makePropertiesForInteractions(
        portr.interactionEvents,
        portr.idsIndiv[i],
        portr.idsIntermediateRepresentation[i],
      );
      // Finally create the entity
      const entity = new Entity({
        geometry: geomJson,
        properties,
      });
      // So that we can use "getId" to get the IRI of the materialisation,
      // as on OpenLayers Features
      entity._materialisationId = portr.materialisations[i];
      // So that we can use xx.id_ in interaction.js
      // without having to care whether it is an openlayers feature
      // or an openglobus entity
      entity.id_ = `og-${entity.id}`;
      // The mapping used for interaction, as on MapWidget
      materialisationMapping[portr.materialisations[i]] = entity;
      ogLayer.add(entity);
    });
    // Set the zIndex for the layer if specified
    if (portr.zIndex) {
      ogLayer.setZIndex(portr.zIndex);
    }
    // The mapping idMaterialisation -> og.Entity
    terrainWidget.setMaterialisationMapping(materialisationMapping);
    // Finally add the layer to the terrain view
    ogLayer.addTo(terrainWidget.ogTerrain.planet);
  });
  return portrayals;
};
