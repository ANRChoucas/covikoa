/**
* To store and instantiate the interactions
* that might have been defined in the derivation model
*
*/
import { Entity } from '@openglobus/og';
import { QUERY_URL } from './consts';
import {
  reqQuery,
  makeQueryDataIndividual,
  makeQueryInteractionFollowPropertyPathForTarget,
  makeQueryInteractionFollowPropertyPathForRest,
  makeQueryInteractionSameIndividualForTarget,
  makeQueryInteractionSameIndividualForRest,
} from './queries';
import displayPopup from './popup';
import { makeStyle as makeStyleOl, getModifiedOlStyle, noStyle } from './utils/ol-style';
import { makeStyle as makeStyleOg, parseRgbaColor4v } from './utils/og-style';
import { getCorrespondingFeatureOnAnyMapOrTerrain } from './helpers';
import MapWidgetOpenLayers from './widgets/mapWidgetOpenLayers';
import TerrainWidgetOpenglobus from './widgets/terrainWidgetOpenglobus';

/**
 * Cache for queries that are used to retrieve iri of materialisation targeted
 * by the interaction.
 * TODO: implement a real cache with some eviction strategy to not let it grow indefinitely
 * @type {{}}
 */
const cacheInteractionQuery = {};

/**
 * Set of current pending queries
 * @type {Set<String>}
 */
const queryPending = new Set();

/**
 * Enum-like object to describe possibles events.
 */
const InteractionEvent = {
  SingleClick: 'SingleClick',
  DoubleClick: 'DoubleClick',
  ContextMenu: 'ContextMenu',
  MouseOver: 'MouseOver',
};

/**
 * Enum-like object to describe possibles reason for ending
 * the outcome(s) of the interaction.
 */
const InteractionEnding = {
  Closable: 'http://lig-tdcge.imag.fr/steamer/covikoa/interaction#Closable',
  Duration: 'http://lig-tdcge.imag.fr/steamer/covikoa/interaction#Duration',
  DuringEvent: 'http://lig-tdcge.imag.fr/steamer/covikoa/interaction#DuringEvent',
  EmptySelection: 'http://lig-tdcge.imag.fr/steamer/covikoa/interaction#EmptySelection',
  SameEventOnOtherIndividual: 'http://lig-tdcge.imag.fr/steamer/covikoa/interaction#SameEventOnOtherIndividual',
};

/**
 * A (somehow weird) mapping source -> destination, for each InteractionEvent type,
 * where source: the interacted feature
 *   and destination: the features that are rendered differently for this source.
 * @type {{[p: string]: {destination: [], source: null}|{destination: [], source: null}|{destination: [], source: null}|{destination: [], source: null}, '[InteractionEvent.SingleClick]': {destination: *[], source: null}, '[InteractionEvent.DoubleClick]': {destination: *[], source: null}, '[InteractionEvent.ContextMenu]': {destination: *[], source: null}, '[InteractionEvent.MouseOver]': {destination: *[], source: null}}}
 */
const SourceDestination = {
  [InteractionEvent.SingleClick]: {
    source: null,
    destination: [],
  },
  [InteractionEvent.DoubleClick]: {
    source: null,
    destination: [],
  },
  [InteractionEvent.ContextMenu]: {
    source: null,
    destination: [],
  },
  [InteractionEvent.MouseOver]: {
    source: null,
    destination: [],
  },
};

const makeQueryWithCache = async (query) => {
  if (!cacheInteractionQuery[query]) {
    queryPending.add(query);
    const queryResult = await reqQuery(QUERY_URL, query);
    cacheInteractionQuery[query] = queryResult;
    queryPending.delete(query);
  }
  return cacheInteractionQuery[query];
};

const handlePopup = async (ft, coords, map) => {
  if (!ft.get('_hasProperties')) {
    // The feature wasn't already enriched ...
    const id = ft.get('_idIntermediateRepresentation');
    const query = makeQueryDataIndividual(id);
    const queryResult = await reqQuery(QUERY_URL, query);
    const properties = { _hasProperties: true };
    queryResult.results.bindings
      .forEach((d) => {
        if (d.v.type !== 'bnode') {
          if (properties[d.p.value] !== undefined) {
            properties[d.p.value].push(d.v.value);
          } else {
            properties[d.p.value] = [d.v.value];
          }
        }
      });
    // Enrich the feature so that a future click doesnt trigger the query again..
    ft.setProperties(properties);
    displayPopup(map, ft, coords);
  } else {
    // Feature was already enriched so we can display the infobox directly
    displayPopup(map, ft, coords);
  }
};

const getFeaturesAtPixel = (map, pixel, excludeOverlayLayer = true) => {
  let ft;
  const filter = excludeOverlayLayer
    ? (l) => {
      if (l.get('isOverlay')) return false;
      return true;
    }
    : undefined;
  map.forEachFeatureAtPixel(
    pixel,
    (feature) => {
      if (ft) return;
      ft = feature;
    }, {
      hitTolerance: 2,
      layerFilter: filter,
    },
  );
  return ft;
};

const doInteraction = (queryResult, thisInteraction, outcome, mappingSrcDest, ft) => {
  const materialisations = [...new Set(queryResult.results.bindings[0].materialisations.value.split(';'))];
  const endings = thisInteraction.ending;
  // Remember that this feature is the source of the interaction
  mappingSrcDest.source = ft;
  // For each materialisation id ...
  materialisations.forEach((idMat) => {
    // .. we want to obtain the corresponding feature on any map/terrain widget
    // (as well as a reference to the hosting widget)
    const {
      feature: _ft, mapWidget: targetMapWidget,
    } = getCorrespondingFeatureOnAnyMapOrTerrain(idMat);
    // Trigger different action depending on the widget
    // (a todo-thing could be te define a common interface to avoid this)
    if (targetMapWidget instanceof MapWidgetOpenLayers) {
      // Make the style of this outcome
      if (outcome.symbolizer) {
        const style = makeStyleOl({
          type: 'PolygonSymbolizer',
          specJSON: JSON.stringify(outcome.symbolizer),
        });
        if (outcome.typeOutcome === 'target') style.zIndex_ = 1000;
        // The idea is:
        // - we clone the feature and give the style of the InteractionSymbolizer to the clone
        // - we put the cloned feature on the overlay layer
        // At the end of the interaction, the cloned feature is removed.
        const clone = _ft.clone();
        clone.setStyle(style);
        targetMapWidget.getOverlayLayer().getSource().addFeature(clone);
        // What to do to end this interaction outcome
        const cbEndInteraction = () => {
          targetMapWidget.getOverlayLayer().getSource().removeFeature(clone);
        };
        // When to do it
        if (thisInteraction.endingDuration) { // TODO: handle if "Duration" is not the only ending
          setTimeout(cbEndInteraction, thisInteraction.endingDuration * 1000);
        } else {
          mappingSrcDest.destination.push([endings, cbEndInteraction]);
        }
      } else if (outcome.symbolizerModifiers) {
        const oldStyle = _ft.getStyle();
        const typeGeom = _ft.getGeometry().getType();
        const newStyle = getModifiedOlStyle(oldStyle, typeGeom, outcome.symbolizerModifiers);
        if (outcome.typeOutcome === 'target') newStyle.zIndex_ = 1000;
        // The idea is:
        // - we take the current style of the feature, clone it and modify it according to
        //   the SymbolizerModifiers
        // - we set the feature style to "noStyle"
        // - we clone the feature and give the new style to the clone
        // - we put the cloned feature on the overlay layer
        // At the end of the interaction, the cloned feature is removed
        // and the real feature gets its old style back.
        _ft.setStyle(noStyle);
        const clone = _ft.clone();
        clone.setStyle(newStyle);
        targetMapWidget.getOverlayLayer().getSource().addFeature(clone);
        // What to do to end this interaction outcome
        const cbEndInteraction = () => {
          _ft.setStyle(oldStyle);
          targetMapWidget.getOverlayLayer().getSource().removeFeature(clone);
        };
        // When to do it
        if (thisInteraction.endingDuration) { // TODO: handle if "Duration" is not the only ending
          setTimeout(cbEndInteraction, thisInteraction.endingDuration * 1000);
        } else {
          mappingSrcDest.destination.push([endings, cbEndInteraction]);
        }
      }
    } else if (targetMapWidget instanceof TerrainWidgetOpenglobus) {
      if (outcome.symbolizer) {
        // _ft is an openglobus Entity
        const style = makeStyleOg(outcome.symbolizer);
        // get old style values
        const oldFillColor = { ..._ft.geometry._style.fillColor };
        const oldLineColor = { ..._ft.geometry._style.lineColor };
        // const oldStrokeColor = { ..._ft.geometry._style.strokeColor };
        const oldLineWidth = { ..._ft.geometry._style.lineWidth };
        const oldStrokeWidth = { ..._ft.geometry._style.strokeWidth };
        // compute new values
        const newFillColor = style.fillColor ? parseRgbaColor4v(style.fillColor) : oldFillColor;
        const newLineColor = style.lineColor ? parseRgbaColor4v(style.lineColor) : oldLineColor;
        // const newStrokeColor = style.strokeColor ? parseRgbaColor4v(style.strokeColor) : oldStrokeColor;
        const newLineWidth = style.lineWidth || oldLineWidth;
        const newStrokeWidth = style.strokeWidth || oldStrokeWidth;

        // set new values..
        _ft.geometry.setFillColor4v(newFillColor);
        _ft.geometry.setLineColor4v(newLineColor);
        // _ft.geometry.setStrokeColor4v(newStrokeColor);
        _ft.geometry.setLineWidth(newLineWidth);
        _ft.geometry.setStrokeWidth(newStrokeWidth);
        // ... and bring entity to front
        if (outcome.typeOutcome === 'target') _ft.geometry.bringToFront();
        // end of the interaction
        const cbEndInteraction = () => {
          _ft.geometry.setFillColor4v(oldFillColor);
          _ft.geometry.setLineColor4v(oldLineColor);
          // _ft.geometry.setStrokeColor4v(oldStrokeColor);
          _ft.geometry.setLineWidth(oldLineWidth);
          _ft.geometry.setStrokeWidth(oldStrokeWidth);
        };
        if (thisInteraction.endingDuration) { // TODO: handle if "Duration" is not the only ending
          setTimeout(cbEndInteraction, thisInteraction.endingDuration * 1000);
        } else {
          mappingSrcDest.destination.push([endings, cbEndInteraction]);
        }
      } else if (outcome.symbolizerModifiers) {

      }
    }
  });
};

const dispatchInteraction = async (eventType, map, ft, coords) => {
  const propertyName = `_allows${eventType}`;
  const idInteraction = ft.get(propertyName);
  if (!idInteraction) return;

  const mappingSrcDest = SourceDestination[eventType];

  // Get the description of the interaction
  const thisInteraction = global.State.interactions[idInteraction];
  // Determine what to do for each outcome of this interaction
  thisInteraction.outcomes.forEach(async (outcome) => {
    if (
      thisInteraction.analyticalPurpose === 'http://lig-tdcge.imag.fr/steamer/covikoa/interaction#identify'
      && outcome.onComponent
    ) { // Todo: improve dispatching if multiple popup ...
      await handlePopup(ft, coords, map);
    } else if (
      outcome.selectionStrategyType === 'http://lig-tdcge.imag.fr/steamer/covikoa/interaction#FollowPropertyPath'
      && outcome.selectionStrategyTargetsEntitiesFrom
      && outcome.selectionStrategyPropertyPath
      && (outcome.symbolizer || outcome.symbolizerModifiers)
    ) {
      const thisMaterialisation = ft.getId();
      const targetPortrayalOrPortrayalRule = outcome.selectionStrategyTargetsEntitiesFrom;
      const propertyPath = outcome.selectionStrategyPropertyPath;
      // We need to perform a different request depending on if this is an outcome
      // for the corresponding target feature / entity
      // or if this is an outcome for the rest of the features/entity
      // of the portrayal / portrayal rule
      const fnQuery = outcome.typeOutcome === 'target'
        ? makeQueryInteractionFollowPropertyPathForTarget
        : makeQueryInteractionFollowPropertyPathForRest;
      const query = fnQuery(
        thisMaterialisation,
        propertyPath,
        targetPortrayalOrPortrayalRule,
      );
      if (queryPending.has(query)) return;
      const queryResult = await makeQueryWithCache(query);
      doInteraction(queryResult, thisInteraction, outcome, mappingSrcDest, ft);
    } else if (
      outcome.selectionStrategyType === 'http://lig-tdcge.imag.fr/steamer/covikoa/interaction#SameIndividual'
      && outcome.selectionStrategyTargetsEntitiesFrom
      && (outcome.symbolizer || outcome.symbolizerModifiers)
    ) {
      const thisMaterialisation = ft.getId();
      const targetPortrayalOrPortrayalRule = outcome.selectionStrategyTargetsEntitiesFrom;
      // We need to perform a different request depending on if this is an outcome
      // for the corresponding target feature / entity
      // or if this is an outcome for the rest of the features/entity
      // of the portrayal / portrayal rule
      const fnQuery = outcome.typeOutcome === 'target'
        ? makeQueryInteractionSameIndividualForTarget
        : makeQueryInteractionSameIndividualForRest;
      const query = fnQuery(
        thisMaterialisation,
        targetPortrayalOrPortrayalRule,
      );
      if (queryPending.has(query)) return;
      const queryResult = await makeQueryWithCache(query);
      doInteraction(queryResult, thisInteraction, outcome, mappingSrcDest, ft);
    }
  });
};

/**
 * When a new event occurs this function restores the style of the entities for which it had been modified by the previous event, according to the ending type of the interaction.
 *
 * @param {ol.Feature|og.Entity} ft - the ol feature or the og entity that is interacted with
 * @param {String} eventType - the type of event
 * @returns {boolean} whether to continue to process the interaction or not
 */
const discardPreviousInteractionState = (ft, eventType) => {
  // The source -> destination mapping for this event type
  const mappingSrcDest = SourceDestination[eventType];
  // The targeted feature is the same as the previous one
  // (i.e. the cursor is moving / clicking on the same feature, so nothing to do)
  if (mappingSrcDest.source && ft && ft.id_ === mappingSrcDest.source.id_) {
    return false;
  }
  if (
    mappingSrcDest.source && !ft
  ) {
    // There was a feature selected by this event (mappingSrcDest.source)
    // but now there is no feature under this event (!ft)
    // This corresponds to discarding the outcome of interaction
    // that happens during the event (EmptySelection)
    // or that are discarded by an empty selection (EmptySelection)
    const filtered = [];
    mappingSrcDest.source = undefined;
    mappingSrcDest.destination.forEach(([endings, callbackEnd]) => {
      if (
        endings.includes(InteractionEnding.DuringEvent)
        || endings.includes(InteractionEnding.EmptySelection)
      ) {
        if (callbackEnd) callbackEnd();
      } else {
        filtered.push([endings, callbackEnd]);
      }
    });
    mappingSrcDest.destination = filtered;
  } else if (mappingSrcDest.source && (ft.id_ !== mappingSrcDest.source.id_)) {
    // There was a feature selected by this event (mappingSrcDest.source)
    // and there is now a new feature selected (ft.id_ !== mappingSrcDest.source.id_)
    // This corresponds to discarding the outcome of interaction
    // that happens during the event (DuringEvent) or that are
    // discarded by the same event / interaction on an other individual (SameEventOnOtherIndividual)
    const filtered = [];
    mappingSrcDest.destination.forEach(([endings, callbackEnd]) => {
      mappingSrcDest.source = undefined;
      if (
        endings.includes(InteractionEnding.DuringEvent)
        || endings.includes(InteractionEnding.SameEventOnOtherIndividual)
      ) {
        if (callbackEnd) callbackEnd();
      } else {
        filtered.push([endings, callbackEnd]);
      }
    });
    mappingSrcDest.destination = filtered;
  }
  if (!ft) return false;
  return true;
};

const callBackInteractionMap = async (e, eventType, olMap) => {
  // Get a reference to the map feature(s) behind the click
  const ft = getFeaturesAtPixel(olMap, e.pixel, true);
  const proccessInteraction = discardPreviousInteractionState(ft, eventType);
  if (!proccessInteraction) return;
  dispatchInteraction(eventType, olMap, ft, e.coordinate);
};

const bindSingleClickMap = (mapWidget) => {
  const eventType = InteractionEvent.SingleClick;

  mapWidget.olMap.on('singleclick', async (e) => {
    callBackInteractionMap(e, eventType, mapWidget.olMap);
  });
};

const bindDoubleClickMap = (mapWidget) => {
  const eventType = InteractionEvent.DoubleClick;

  mapWidget.olMap.on('dblclick', async (e) => {
    callBackInteractionMap(e, eventType, mapWidget.olMap);
  });
};

const bindMouseOverMap = (mapWidget) => {
  const eventType = InteractionEvent.MouseOver;

  mapWidget.olMap.on('pointermove', async (e) => {
    if (e.dragging) return;
    await callBackInteractionMap(e, eventType, mapWidget.olMap);
  });
};

const bindContextMenuMap = (mapWidget) => {
  const eventType = InteractionEvent.ContextMenu;

  mapWidget.olMap.on('dblclick', async (e) => {
    callBackInteractionMap(e, eventType, mapWidget.olMap);
  });
};

const callBackInteractionTerrain = async (event, eventType, ogTerrain) => {
  console.log(event);
  const { pickingObject } = event;
  const ft = pickingObject instanceof Entity
    ? pickingObject
    : null;
  const processInteraction = discardPreviousInteractionState(ft, eventType);
  if (!processInteraction) return;
  const coordinates = ogTerrain.planet.getLonLatFromPixelTerrain(event);
  // TODO: make coordinates in same format for ol and og
  dispatchInteraction(eventType, ogTerrain, ft, coordinates);
};

const bindSingleClickTerrain = (terrainWidget) => {
  const eventType = InteractionEvent.SingleClick;

  terrainWidget.ogTerrain.planet.renderer.events.on('lclick', async (event) => {
    await callBackInteractionTerrain(event, eventType, terrainWidget.ogTerrain);
  });
};

const bindMouseOverTerrain = (terrainWidget) => {
  const eventType = InteractionEvent.MouseOver;

  terrainWidget.ogTerrain.planet.renderer.events.on('mousemove', async (event) => {
    await callBackInteractionTerrain(event, eventType, terrainWidget.ogTerrain);
  });
};

const bindDoubleClickTerrain = (terrainWidget) => {
  const eventType = InteractionEvent.DoubleClick;

  terrainWidget.ogTerrain.planet.renderer.events.on('ldblclick', async (event) => {
    await callBackInteractionTerrain(event, eventType, terrainWidget.ogTerrain);
  });
};

const bindContextMenuTerrain = (terrainWidget) => {
  const eventType = InteractionEvent.ContextMenu;

  terrainWidget.ogTerrain.planet.renderer.events.on('rclick', async (event) => {
    await callBackInteractionTerrain(event, eventType, terrainWidget.ogTerrain);
  });
};

export const bindMapInteractions = (mapWidget) => {
  // TODO: we should not call these functions if no interaction use these event
  //  (in particular for mouseover)
  bindSingleClickMap(mapWidget);
  bindMouseOverMap(mapWidget);
  bindDoubleClickMap(mapWidget);
  bindContextMenuMap(mapWidget);
};

export const bindTerrainInteractions = (terrainWidget) => {
  // TODO: same as with map interactions
  bindSingleClickTerrain(terrainWidget);
  bindMouseOverTerrain(terrainWidget);
  bindDoubleClickTerrain(terrainWidget);
  bindContextMenuTerrain(terrainWidget);
};
