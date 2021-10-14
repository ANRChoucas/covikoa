// import Attribution from 'ol/control/Attribution';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Synchronize from 'ol-ext/interaction/Synchronize';
import { defaults as defaultInteractions } from 'ol/interaction';
import View from 'ol/View';
import { makeStyleFnOrStyleObject } from './ol-style';
import { DOTS_PER_INCH, INCHES_PER_UNIT } from '../consts';
import { wktFormat } from '../helpers';
import { buildPortrayalsArray } from './portrayalConversion';

/**
 * Convert scale denominator to zoom level, using definitions and methodology from
 * https://docs.geoserver.org/latest/en/user/styling/ysld/reference/scalezoom.html.
 *
 * @param scaleDenominator
 * @returns {number}
 */
export const getZoomLevelFromScale = (scaleDenominator) => {
  const scale0 = 559082264;
  if (scaleDenominator > 559082264) return 0;
  let s = scale0;
  let i = 0;
  while (true) {
    if (scaleDenominator < s && scaleDenominator > s / 2) {
      const high = s;
      const low = s / 2;
      const r = Math.abs(scaleDenominator - high) / (high - low);
      return i + r;
    }
    i += 1;
    s /= 2;
  }
};

/**
 * Get resolution value from zoom level
 * (used for Style function that depends on resolution
 *  while the user specified this using a zoom level).
 *
 * @param {number} z - The zoom level
 * @returns {number} The corresponding resolution
 */
export const getResolutionFromZoomLevel = (z) => {
  const max_resolution = (new View({
    center: [0, 0],
    zoom: 5,
  })).getMaxResolution();
  return max_resolution / (2 ** z);
};

/**
 * Synchronize the `ol.Map`s between the various `mapWidgets`
 * according to what is described in `componentsDescription`.
 *
 * @param mapWidgets
 * @param componentsDescription
 * @returns {void}
 */
export const handleMapSynchronisation = (mapWidgets, componentsDescription) => {
  for (let i = 0; i < mapWidgets.length; i++) {
    const map1 = mapWidgets[i].olMap;
    const iriMap1 = map1.getTarget().getAttribute('iri');
    const descriptionMap1 = componentsDescription
      .find((el) => el.iri === iriMap1);

    if (descriptionMap1.linkedTo) {
      const iriOtherMaps = descriptionMap1.linkedTo;
      mapWidgets.forEach((_mapWidget) => {
        const map2 = _mapWidget.olMap;
        if (iriOtherMaps.indexOf(map2.getTarget().getAttribute('iri')) > -1) {
          map1.addInteraction(new Synchronize({ maps: [map2] }));
        }
      });
    }
  }
};

// TODO: this very much spaggethi code for now and some part should be factorised
export const makeMapLayersAndPortrayals = (res_list, mapWidget) => {
  // We want to build an array containing all the necessary informations
  // to create the corresponding OL VectorLayers
  const portrayals = buildPortrayalsArray(res_list);

  // The idea is to have, for each component, a mapping
  // idMaterialisation -> feature
  // so that we can quickly get the feature / entity
  // to be modified when an interaction needs it
  // (we use the same mechanism on TerrainWidget).
  const materialisationMapping = {};

  portrayals.forEach((portr) => {
    // Read the array of geometries, in wkt
    const features = portr.geometries.map((geom) => wktFormat.readFeature(
      geom.replace('<http://www.opengis.net/def/crs/EPSG/0/4326> ', ''), {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      },
    ));

    // Store various internal information as properties on the ol features
    features.forEach((ft, i) => {
      // Set the id of each ol features as the id of
      // its corresponding materialisation
      ft.setId(portr.materialisations[i]);
      // Does it allow interactions, and on which events ?
      if (portr.interactionEvents['http://lig-tdcge.imag.fr/steamer/covikoa/interaction#singleClick']) {
        ft.setProperties({ _allowsSingleClick: portr.interactionEvents['http://lig-tdcge.imag.fr/steamer/covikoa/interaction#singleClick'] });
      }
      if (portr.interactionEvents['http://lig-tdcge.imag.fr/steamer/covikoa/interaction#mouseOver']) {
        ft.setProperties({ _allowsMouseOver: portr.interactionEvents['http://lig-tdcge.imag.fr/steamer/covikoa/interaction#mouseOver'] });
      }
      if (portr.interactionEvents['http://lig-tdcge.imag.fr/steamer/covikoa/interaction#doubleClick']) {
        ft.setProperties({ _allowsDoubleClick: portr.interactionEvents['http://lig-tdcge.imag.fr/steamer/covikoa/interaction#doubleClick'] });
      }
      if (portr.interactionEvents['http://lig-tdcge.imag.fr/steamer/covikoa/interaction#contextMenu']) {
        ft.setProperties({ _allowsContextMenu: portr.interactionEvents['http://lig-tdcge.imag.fr/steamer/covikoa/interaction#contextMenu'] });
      }
      // The iri of the individual from the SDM
      ft.setProperties({ _idTargetIndividual: portr.idsIndiv[i] });
      // The iri of the gviz:GeoVisualIntermediateRepresentation
      ft.setProperties({ _idIntermediateRepresentation: portr.idsIntermediateRepresentation[i] });
      materialisationMapping[portr.materialisations[i]] = ft;
    });

    let layer;

    if (portr.symbolizer) { // One symbolizer (Ol style / style function) for the group of features
      const style = makeStyleFnOrStyleObject(portr.symbolizer, portr.scaleRange);
      features.forEach((ft) => {
        ft.setStyle(style);
      });
      layer = new VectorLayer({
        source: new VectorSource({ features }),
      });
      // const style = makeStyleFnOrStyleObject(portr.symbolizer, portr.scaleRange);
      // layer = new VectorLayer({
      //   source: new VectorSource({ features }),
      //   style,
      // });
    } else { // One symbolizer (Ol style / style function) for each feature in the group
      features.forEach((ft, i) => {
        const style = makeStyleFnOrStyleObject(portr.symbolizers[i], portr.scaleRange);
        ft.setStyle(style);
      });
      // If we have a punctual symbolisation (maybe of type Proportionnal Symbols)
      // we order the features from the larger symbol to the smaller
      // so that large symbols dont hide small symbols.
      if (
        portr.symbolizers[0].type === 'PointSymbolizer'
        && portr.symbolizers[0].specJSON.indexOf('Mark') > -1
      ) {
        let startZIndex = 0;
        // sort the features from the largest to the smallest ...
        features.sort((a, b) => b.getStyle()
          .image_
          .getSize()[0] - a.getStyle()
          .image_
          .getSize()[0]);
        features.forEach((ft) => {
          // eslint-disable-next-line no-param-reassign,no-plusplus
          ft.style_.zIndex_ = ++startZIndex;
        });
      }
      layer = new VectorLayer({
        source: new VectorSource({ features }),
      });
    }

    // Set the zIndex for the layer if specified
    if (portr.zIndex) {
      layer.setZIndex(portr.zIndex);
    }
    // The mapping idMaterialisation -> ol.Feature
    mapWidget.setMaterialisationMapping(materialisationMapping);
    // Finally add the layer to the map
    mapWidget.olMap.addLayer(layer);
  });

  return portrayals;
};

/**
 *
 * @param deactivatedInteractions
 * @returns {Collection<import("./interaction/Interaction.js").default>}
 */
export const prepareDefaultMapInteractions = (deactivatedInteractions) => {
  if (!deactivatedInteractions) {
    return defaultInteractions();
  }
  const o = {};
  deactivatedInteractions.forEach((k) => {
    if (k === 'panning') {
      o.dragPan = false;
    } else if (k === 'zooming') {
      o.doubleClickZoom = false;
      o.mouseWheelZoom = false;
      o.pinchZoom = false;
      o.shiftDragZoom = false;
    } else if (k === 'rotating') {
      o.pinchRotate = false;
      o.altShiftDragRotate = false;
    }
  });
  return defaultInteractions(o);
};
