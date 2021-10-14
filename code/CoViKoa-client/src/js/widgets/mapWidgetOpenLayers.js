import '../../css/mapWidget.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Widget } from '@lumino/widgets';
// import { Attribution } from 'ol/control';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, XYZ } from 'ol/source';
import { wktFormat } from '../helpers';
import { getZoomLevelFromScale, prepareDefaultMapInteractions } from '../utils/map';

/**
 * Widget containing the OpenLayers map and corresponding to a gviz:Map2dComponent.
 * (a to do thing is to create a generic MapWidget then and extend it to a
 *  MapWidgetOpenLayers and a MapWidgetLeaflet for example)
 *
 */
export default class MapWidgetOpenLayers extends Widget {
  static createNode() {
    return document.createElement('div');
  }

  constructor(params) {
    super({ node: MapWidgetOpenLayers.createNode() });
    // this.id = options.id;
    this.addClass('cvk-MapWidget');
    // this.addClass('active');
    this.title.label = params.title;
    this.title.closable = false;
    this.timeoutHandle = null;
    this.params = params;
  }

  onAfterAttach(msg) { // eslint-disable-line no-unused-vars
    this._create_ol_map();
    this.update();
  }

  onResize(msg) { // eslint-disable-line no-unused-vars
    if (!this.isAttached) return;
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }
    this.timeoutHandle = setTimeout(() => {
      this.olMap.updateSize();
      this.timeoutHandle = null;
    }, 10); // Maybe we dont need any timeout after all...
  }

  processMessage(msg) { // eslint-disable-line no-unused-vars
    super.processMessage(msg);
    if (msg.type === 'all-widgets-attached') {
      this.onAllWidgetsAttached(msg);
    }
  }

  _create_ol_map() {
    const params = this.params; // eslint-disable-line prefer-destructuring
    const mapElement = document.createElement('div');
    mapElement.classList.add('ol-map');
    this.node.appendChild(mapElement);
    this.mapElement = mapElement;

    // TODO: maybe we should set this attribute on the parent node
    //       (as on other widgets)
    mapElement.setAttribute('iri', params.iri);

    let baseMapLayer;
    if (params.options.basemapTemplateUrl && params.options.basemapAttribution) {
      baseMapLayer = new TileLayer({
        source: new XYZ({
          url: params.options.basemapTemplateUrl,
          attributions: [params.options.basemapAttribution],
        }),
      });
    }

    const view = new View({
      center: [0, 0],
      zoom: 5,
    });

    if (params.options.constrainedScale) {
      if (params.options.constrainedScale.type === 'zoom') {
        view.setMaxZoom(params.options.constrainedScale.max);
        view.setMinZoom(params.options.constrainedScale.min);
      } else if (params.options.constrainedScale.type === 'scaleDenominator') {
        view.setMaxZoom(getZoomLevelFromScale(params.options.constrainedScale.max));
        view.setMinZoom(getZoomLevelFromScale(params.options.constrainedScale.min));
      }
    }


    if (this._paramsHasExtent()) {
      // Fit extent before attaching the view to the map,
      // it will center the view but not zoom on it
      // We will re-do this when all the widgets
      // will have there real size (but because there is
      // some delay, its nice to have the view centered first...)
      this.fitExtentFromParams(view);
    }

    // Prepare the interactions with the map (zooming, panning, etc.)
    // because they are all activated by default
    // but maybe the user choosed to deactivate some of them.
    const interactions = prepareDefaultMapInteractions(params.options.deactivatedInteractions);

    this.olMap = new Map({
      interactions,
      layers: baseMapLayer ? [baseMapLayer] : undefined,
      target: mapElement,
      view,
    });
  }

  _paramsHasExtent() {
    return !!this.params.options.geomInitialExtent;
  }

  fitExtentFromParams(view) {
    const _view = view || this.olMap.getView();
    // Compute the zoom and the center from `params.geomInitialExtent`,
    // if existing, which is the expected WKT extent .
    const feature = wktFormat.readFeature(this.params.options.geomInitialExtent, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    const geom = feature.getGeometry();
    _view.fit(geom);
  }

  onAllWidgetsAttached(msg) { // eslint-disable-line no-unused-vars
    // Fit extent if required
    if (this._paramsHasExtent()) {
      setTimeout(() => {
        this.fitExtentFromParams();
      }, 125);
    }

    // Create the overlay layer
    this.overlayLayer = new VectorLayer({
      source: new VectorSource(),
      map: this.olMap,
      properties: { isOverlay: true },
    });
  }

  getOverlayLayer() {
    return this.overlayLayer;
  }

  setMaxSize() {
    if (this.params.width) {
      this.node.style.maxWidth = `${this.params.width}px`;
    }
    if (this.params.height) {
      this.node.style.maxHeight = `${this.params.height}px`;
    }
  }

  setMaterialisationMapping(mapping) {
    this.materialisationMapping = mapping;
  }
}
