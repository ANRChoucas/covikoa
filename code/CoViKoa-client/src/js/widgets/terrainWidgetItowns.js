// import '../../css/mapWidget.css';
// import * as itowns from 'itowns';
// // import { transform } from 'ol/proj';
// import { Widget } from '@lumino/widgets';
// import { NS_SYMBOLIZER } from '../consts';
// import { getResoFromScale, getValue, altitudeFromZoomLevel, debounce } from '../helpers';
//
//
// const makeItownsLayer = (parsedData, name, style) => new itowns.ColorLayer(
//   name, {
//     name,
//     style,
//     source: new itowns.FileSource({
//       parsedData,
//     }),
//     // transparent: true,
//   },
// );
//
// /*
// * Widget containing the terrain view (made with itowns)
// * (or better make it a generic terrain widget
// * and then extend it to an ItownsTerrainWidget and futur-maybe CesiumTerrainWidget)
// * that corresponds to a gviz:Map3dComponent.
// *
// */
// export default class TerrainWidgetItowns extends Widget {
//   static createNode() {
//     return document.createElement('div');
//   }
//
//   constructor(options) {
//     super({ node: TerrainWidgetItowns.createNode() });
//     this.id = options.id;
//     this.addClass('cvk-TerrainWidgetItowns');
//     // this.addClass('active');
//     // this.title.label = getValue(options.map_param, 'mapTitle', null);
//     // this.title.caption = options.description;
//     this.title.closable = false;
//     this.timeoutHandle = null;
//     // this.map_param = options.map_param; // eslint-disable-line prefer-destructuring
//   }
//
//   onAfterShow(msg) { // eslint-disable-line no-unused-vars
//     console.log('onAfterShow');
//     this._create_terrain();
//   }
//
//   onAfterAttach(msg) { // eslint-disable-line no-unused-vars
//     if (this.isVisible) {
//       console.log('onAfterAttach and visible');
//       this._create_terrain();
//     }
//   }
//
//   get viewerDiv() {
//     return this.node.getElementById('viewerDiv');
//   }
//
//   onActivateRequest(msg) { // eslint-disable-line no-unused-vars
//     if (this.isAttached) {
//       this.viewerDiv.focus();
//     }
//   }
//
//   onAfterHide() {
//     console.log('onAfterHide');
//     this.node.classList.remove('active');
//     this.node.querySelectorAll('*')
//       .forEach((el) => { el.remove(); });
//     delete this.view;
//     this.view = null;
//     // Reset onResize to no-op :
//     this.onResize = () => {};
//   }
//
//   _onResize(msg) {
//     if (this.isVisible && this.view) {
//       this.view.resize(msg.width, msg.height);
//       console.log('Resized itowns view');
//     }
//   }
//
//   _create_terrain() {
//     const viewerDiv = document.createElement('div');
//     viewerDiv.id = 'terrain';
//     // viewerDiv.className = 'map active';
//     this.node.appendChild(viewerDiv);
//     const [altitude, longitude, latitude] = [20000000, 2.351323, 48.856712];
//     this.view = new itowns.GlobeView(viewerDiv, {
//       coord: new itowns.Coordinates('EPSG:4326', longitude, latitude),
//       range: altitude,
//       tilt: 45,
//     });
//
//     this.view.addLayer(new itowns.ColorLayer('ORTHO', {
//       source: new itowns.WMTSSource({
//         protocol: 'wmts',
//         url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wmts',
//         name: 'ORTHOIMAGERY.ORTHOPHOTOS',
//         tileMatrixSet: 'PM',
//         format: 'image/jpeg',
//         projection: 'EPSG:3857',
//         zoom: { min: 0, max: 17 },
//       }),
//     }));
//
//     this.view.addLayer(new itowns.ElevationLayer('MNT_WORLD', {
//       source: new itowns.WMTSSource({
//         protocol: 'wmts',
//         url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wmts',
//         name: 'ELEVATION.ELEVATIONGRIDCOVERAGE',
//         tileMatrixSet: 'WGS84G',
//         format: 'image/x-bil;bits=32',
//         projection: 'EPSG:4326',
//         zoom: { min: 0, max: 11 },
//       }),
//     }));
//
//     this.view.addLayer(new itowns.ElevationLayer('MNT_HIGHRES', {
//       source: new itowns.WMTSSource({
//         protocol: 'wmts',
//         url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wmts',
//         name: 'ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES',
//         tileMatrixSet: 'WGS84G',
//         format: 'image/x-bil;bits=32',
//         projection: 'EPSG:4326',
//         zoom: { min: 11, max: 14 },
//       }),
//     }));
//
//     // Define onResize function now the terrain view is setted up
//     // (with little delai to ensure it)
//     setTimeout(() => {
//       this.onResize = debounce(this._onResize, 150);
//     }, 1000);
//   }
//
//   addGeojsonLayer(layer, layer_id, style, visible, crs_in = 'EPSG:4326') {
//     return itowns.GeoJsonParser.parse(JSON.stringify(layer), {
//       buildExtent: true,
//       crsIn: crs_in,
//       crsOut: this.view.tileLayer.extent.crs,
//       mergeFeatures: true,
//       withNormal: false,
//       withAltitude: false,
//     }).then((parsedData) => {
//       const data_layer = makeItownsLayer(parsedData, layer_id, style);
//       data_layer.visible = visible;
//       return this.view.addLayer(data_layer);
//     });
//   }
//
//   removeLayer(layer_name) {
//     if (!this.view) return;
//     const lyr = this.view.getLayers().find((l) => l.name === layer_name);
//     if (!lyr) return;
//     this.view.removeLayer(lyr.id);
//   }
//
//   setVisibleLayer(layer_name, visible) {
//     if (!this.view) return;
//     const lyr = this.view.getLayers().find((l) => l.name === layer_name);
//     if (!lyr) return;
//     lyr.visible = visible;
//     // this.view.notifyChange(lyr);
//   }
// }
