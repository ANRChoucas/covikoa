import '../../css/mapWidget.css';
import '@openglobus/og/css/og.css';
import {
  layer,
  Globe,
  terrain,
  Extent,
  LonLat,
} from '@openglobus/og';
import { Widget } from '@lumino/widgets';
import parse from 'wellknown';
import { debounce } from '../helpers';

const { XYZ } = layer;
const { GlobusTerrain } = terrain;

/**
 * Widget containing the openglobus terrain and corresponding to a gviz:Map3dComponent.
 * (a to do thing is to create a generic TerrainWidget then and extend it to a
 *  TerrainWidgetOpenglobus and a TerrainWidgetItowns for example)
 *
 */
export default class TerrainWidgetOpenglobus extends Widget {
  static createNode() {
    return document.createElement('div');
  }

  constructor(params) {
    super({ node: TerrainWidgetOpenglobus.createNode() });
    this.addClass('cvk-TerrainWidgetItowns');
    this.title.label = params.title;
    this.title.closable = false;
    this.timeoutHandle = null;
    this.params = params;
  }

  onAfterShow(msg) { // eslint-disable-line no-unused-vars
    console.log('onAfterShow');
    this._create_terrain();
  }

  onAfterAttach(msg) { // eslint-disable-line no-unused-vars
    if (this.isVisible) {
      console.log('onAfterAttach and visible');
      this._create_terrain();
    }
  }

  _onResize(msg) {
    //
  }

  processMessage(msg) {
    super.processMessage(msg);
    if (msg.type === 'all-widgets-attached') {
      this.onAllWidgetsAttached(msg);
    }
  }

  onAllWidgetsAttached(msg) {
    if (this._paramsHasExtent()) {
      setTimeout(() => {
        this.fitExtentFromParams();
      }, 225);
    }
  }

  setMaterialisationMapping(mapping) {
    this.materialisationMapping = mapping;
  }

  _create_terrain() {
    const params = this.params; // eslint-disable-line prefer-destructuring
    const viewerDiv = document.createElement('div');
    viewerDiv.classList.add('og-terrain');
    // TODO: maybe we should set this attribute on the parent node
    //       (as on other widgets - cf MapWidget too)
    viewerDiv.setAttribute('iri', params.iri);
    viewerDiv.id = params.iri;
    this.node.appendChild(viewerDiv);

    let baseMapLayer;
    if (params.options.basemapTemplateUrl && params.options.basemapAttribution) {
      baseMapLayer = new XYZ('baseMapLayer', {
        isBaseLayer: true,
        url: params.options.basemapTemplateUrl,
        attributions: params.options.basemapAttribution,
        visibility: true,
        pickingEnabled: false, // this helps when handling pointer events in interaction.js
        specular: [0.0003, 0.00012, 0.00001], // TODO: lightning could be improved
        shininess: 10,
        diffuse: [0.89, 0.9, 0.83],
      });
    }

    this.ogTerrain = new Globe({
      target: viewerDiv.id,
      name: 'Earth',
      terrain: new GlobusTerrain(),
      layers: baseMapLayer ? [baseMapLayer] : undefined,
      autoActivated: true,
      viewExtent: [5.56707, 45.15679, 5.88834, 45.22260],
    });

    this.ogTerrain.planet.setRatioLod(1.8); // openglobus defaults to 1.12 apparently

    // Define onResize function now the terrain view is setted up
    // (with little delai to ensure it)
    setTimeout(() => {
      this.onResize = debounce(this._onResize, 150);
    }, 1000);
  }

  _paramsHasExtent() {
    return !!this.params.options.geomInitialExtent;
  }

  fitExtentFromParams() {
    const geomJson = parse(this.params.options.geomInitialExtent);
    const extent = new Extent(
      new LonLat(180.0, 90.0),
      new LonLat(-180.0, -90.0),
    );
    geomJson.coordinates[0].forEach((c) => {
      const lon = c[0];
      const lat = c[1];
      if (lon < extent.southWest.lon) extent.southWest.lon = lon;
      if (lat < extent.southWest.lat) extent.southWest.lat = lat;
      if (lon > extent.northEast.lon) extent.northEast.lon = lon;
      if (lat > extent.northEast.lat) extent.northEast.lat = lat;
    });
    this.ogTerrain.planet.flyExtent(extent);
  }
}
