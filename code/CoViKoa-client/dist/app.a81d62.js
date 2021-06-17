/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"app": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./src/js/app.js","vendor"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src/index.js?!./src/css/legend.css":
/*!*************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src??postcss!./src/css/legend.css ***!
  \*************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\nexports = ___CSS_LOADER_API_IMPORT___(false);\n// Module\nexports.push([module.i, \"div.ol-legend.ol-unselectable.ol-control {\\n  padding-top: 10px;\\n}\\n\\ndiv.ol-legend.ol-unselectable.ol-control.ol-collapsed {\\n  padding-top: 2px;\\n}\\n\", \"\"]);\n// Exports\nmodule.exports = exports;\n\n\n//# sourceURL=webpack:///./src/css/legend.css?./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src??postcss");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src/index.js?!./src/css/popup.css":
/*!************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src??postcss!./src/css/popup.css ***!
  \************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\nexports = ___CSS_LOADER_API_IMPORT___(false);\n// Module\nexports.push([module.i, \".ol-popup {\\n  position: absolute;\\n  background-color: white;\\n  box-shadow: 0 1px 4px rgba(0,0,0,0.2);\\n  padding: 15px;\\n  border-radius: 10px;\\n  border: 1px solid #cccccc;\\n  bottom: 12px;\\n  left: -50px;\\n  min-width: 280px;\\n}\\n.ol-popup:after, .ol-popup:before {\\n  top: 100%;\\n  border: solid transparent;\\n  content: \\\" \\\";\\n  height: 0;\\n  width: 0;\\n  position: absolute;\\n  pointer-events: none;\\n}\\n.ol-popup:after {\\n  border-top-color: white;\\n  border-width: 10px;\\n  left: 48px;\\n  margin-left: -10px;\\n}\\n.ol-popup:before {\\n  border-top-color: #cccccc;\\n  border-width: 11px;\\n  left: 48px;\\n  margin-left: -11px;\\n}\\n.ol-popup-closer {\\n  text-decoration: none;\\n  position: absolute;\\n  top: 2px;\\n  right: 8px;\\n}\\n.ol-popup-closer:after {\\n  content: \\\"✖\\\";\\n}\\n\\n.ol-popup #popup-content {\\n  margin-top: 5px;\\n}\\n\\n.ol-popup table.table-info {\\n  border-spacing: 1px;\\n  border-radius: 6px;\\n  border: solid 1px gray;\\n}\\n\\n.ol-popup table.table-info td {\\n  vertical-align: top;\\n  min-width: 100px;\\n  max-width: 320px;\\n  color: black;\\n  height: 17px;\\n  padding: 3px;\\n}\\n\\n.ol-popup table.table-info > tbody > tr:nth-child(even) {\\n  background: #e2ecee;\\n}\\n\\n.ol-popup table.table-info > tbody > tr:nth-child(odd) {\\n  background: #ffffff;\\n}\\n\\n.ol-popup table.table-info td.field-name {\\n  color: #535050;\\n  padding-right: 7px;\\n  font-weight: normal;\\n  min-width: 60px;\\n  max-width: 260px;\\n}\\n\\n.ol-popup table.table-info .field-value {\\n  outline: none;\\n  word-wrap: break-word;\\n}\\n\\n.ol-popup .uri-feature {\\n  font-size: 14px;\\n  text-align: center;\\n  margin: 3px;\\n}\\n\", \"\"]);\n// Exports\nmodule.exports = exports;\n\n\n//# sourceURL=webpack:///./src/css/popup.css?./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src??postcss");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src/index.js?!./src/css/styles.css":
/*!*************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src??postcss!./src/css/styles.css ***!
  \*************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\nexports = ___CSS_LOADER_API_IMPORT___(false);\n// Module\nexports.push([module.i, \"html {\\n  box-sizing: border-box;\\n  display: block;\\n}\\n\\nbody {\\n  display: flex;\\n}\\n\\n.ol-map {\\n  width: 100%;\\n  height:800px;\\n}\\n\", \"\"]);\n// Exports\nmodule.exports = exports;\n\n\n//# sourceURL=webpack:///./src/css/styles.css?./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src??postcss");

/***/ }),

/***/ "./src/css/legend.css":
/*!****************************!*\
  !*** ./src/css/legend.css ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var api = __webpack_require__(/*! ../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n            var content = __webpack_require__(/*! !../../node_modules/css-loader/dist/cjs.js!../../node_modules/postcss-loader/src??postcss!./legend.css */ \"./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src/index.js?!./src/css/legend.css\");\n\n            content = content.__esModule ? content.default : content;\n\n            if (typeof content === 'string') {\n              content = [[module.i, content, '']];\n            }\n\nvar options = {};\n\noptions.insert = \"head\";\noptions.singleton = false;\n\nvar update = api(content, options);\n\n\n\nmodule.exports = content.locals || {};\n\n//# sourceURL=webpack:///./src/css/legend.css?");

/***/ }),

/***/ "./src/css/popup.css":
/*!***************************!*\
  !*** ./src/css/popup.css ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var api = __webpack_require__(/*! ../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n            var content = __webpack_require__(/*! !../../node_modules/css-loader/dist/cjs.js!../../node_modules/postcss-loader/src??postcss!./popup.css */ \"./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src/index.js?!./src/css/popup.css\");\n\n            content = content.__esModule ? content.default : content;\n\n            if (typeof content === 'string') {\n              content = [[module.i, content, '']];\n            }\n\nvar options = {};\n\noptions.insert = \"head\";\noptions.singleton = false;\n\nvar update = api(content, options);\n\n\n\nmodule.exports = content.locals || {};\n\n//# sourceURL=webpack:///./src/css/popup.css?");

/***/ }),

/***/ "./src/css/styles.css":
/*!****************************!*\
  !*** ./src/css/styles.css ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var api = __webpack_require__(/*! ../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n            var content = __webpack_require__(/*! !../../node_modules/css-loader/dist/cjs.js!../../node_modules/postcss-loader/src??postcss!./styles.css */ \"./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src/index.js?!./src/css/styles.css\");\n\n            content = content.__esModule ? content.default : content;\n\n            if (typeof content === 'string') {\n              content = [[module.i, content, '']];\n            }\n\nvar options = {};\n\noptions.insert = \"head\";\noptions.singleton = false;\n\nvar update = api(content, options);\n\n\n\nmodule.exports = content.locals || {};\n\n//# sourceURL=webpack:///./src/css/styles.css?");

/***/ }),

/***/ "./src/js/app.js":
/*!***********************!*\
  !*** ./src/js/app.js ***!
  \***********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _css_styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/styles.css */ \"./src/css/styles.css\");\n/* harmony import */ var _css_styles_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_styles_css__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var ol_ol_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ol/ol.css */ \"./node_modules/ol/ol.css\");\n/* harmony import */ var ol_ol_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(ol_ol_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var ol_ext_dist_ol_ext_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ol-ext/dist/ol-ext.css */ \"./node_modules/ol-ext/dist/ol-ext.css\");\n/* harmony import */ var ol_ext_dist_ol_ext_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(ol_ext_dist_ol_ext_css__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var ol_Map__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ol/Map */ \"./node_modules/ol/Map.js\");\n/* harmony import */ var ol_View__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ol/View */ \"./node_modules/ol/View.js\");\n/* harmony import */ var ol_layer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ol/layer */ \"./node_modules/ol/layer.js\");\n/* harmony import */ var ol_source__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ol/source */ \"./node_modules/ol/source.js\");\n/* harmony import */ var ol_format_WKT__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ol/format/WKT */ \"./node_modules/ol/format/WKT.js\");\n/* harmony import */ var _consts__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./consts */ \"./src/js/consts.js\");\n/* harmony import */ var _interactions__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./interactions */ \"./src/js/interactions.js\");\n/* harmony import */ var _queries__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./queries */ \"./src/js/queries.js\");\n/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./style */ \"./src/js/style.js\");\n/* harmony import */ var _legend__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./legend */ \"./src/js/legend.js\");\n\n\n\n\n // import Attribution from 'ol/control/Attribution';\n\n\n\n\n\n\n\n\n // All the geometries will be fetched in WKT\n\nconst wktFormat = new ol_format_WKT__WEBPACK_IMPORTED_MODULE_7__[\"default\"]();\n\nconst getValue = (item, key, defaultValue = null) => item[key] && item[key].value ? item[key].value : defaultValue;\n\nconst getResoFromScale = (z, max_resolution = 40075016.68557849 / 256) => max_resolution / 2 ** z;\n\nconst makeMapElement = map_param => {\n  const mapElement = document.createElement('div');\n  mapElement.className = 'ol-map';\n\n  if (map_param.w && map_param.w.value) {\n    mapElement.style.width = `${map_param.w.value}px`;\n  }\n\n  if (map_param.h && map_param.h.value) {\n    mapElement.style.height = `${map_param.h.value}px`;\n  }\n\n  document.body.appendChild(mapElement);\n  let baseMapLayer;\n\n  if (map_param.basemapTemplateUrl && map_param.basemapAttribution) {\n    baseMapLayer = new ol_layer__WEBPACK_IMPORTED_MODULE_5__[\"Tile\"]({\n      source: new ol_source__WEBPACK_IMPORTED_MODULE_6__[\"XYZ\"]({\n        url: map_param.basemapTemplateUrl.value,\n        attributions: [map_param.basemapAttribution.value]\n      })\n    });\n  } else {\n    baseMapLayer = new ol_layer__WEBPACK_IMPORTED_MODULE_5__[\"Tile\"]({\n      source: new ol_source__WEBPACK_IMPORTED_MODULE_6__[\"XYZ\"]({\n        url: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',\n        attributions: ['Map data: © <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, <a href=\"http://viewfinderpanoramas.org/\">SRTM</a> | Map style: © <a href=\"https://opentopomap.org/\">OpenTopoMap</a> (<a href=\"https://creativecommons.org/licenses/by-sa/3.0/\">CC-BY-SA</a>)']\n      })\n    });\n  }\n\n  const view = new ol_View__WEBPACK_IMPORTED_MODULE_4__[\"default\"]({\n    center: [0, 0],\n    zoom: 3\n  }); // Compute the zoom and the center from `map_param.geomInitialExtent.value`,\n  // if existing, which is the expected WKT extent .\n\n  if (map_param.geomInitialExtent && map_param.geomInitialExtent.value) {\n    const feature = wktFormat.readFeature(map_param.geomInitialExtent.value, {\n      dataProjection: 'EPSG:4326',\n      featureProjection: 'EPSG:3857'\n    });\n    const geom = feature.getGeometry();\n    view.fit(geom);\n  }\n\n  return new ol_Map__WEBPACK_IMPORTED_MODULE_3__[\"default\"]({\n    layers: [baseMapLayer],\n    target: mapElement,\n    view\n  });\n};\n\nconst onload = async () => {\n  // Get information about the \"GeoVisualApplication\" and its component in the KB\n  // in order to create them\n  const gva_context_results = await Object(_queries__WEBPACK_IMPORTED_MODULE_10__[\"reqQuery\"])(_consts__WEBPACK_IMPORTED_MODULE_8__[\"QUERY_URL\"], _queries__WEBPACK_IMPORTED_MODULE_10__[\"queryContextGVA\"]); // Maybe there is multiple map...\n\n  const maps = gva_context_results.results.bindings.map(async result => {\n    const map = makeMapElement(result); // Get informations about the GeoVisualIntermediateRepresentation in the KB\n\n    const gvr_results = await Object(_queries__WEBPACK_IMPORTED_MODULE_10__[\"reqQuery\"])(_consts__WEBPACK_IMPORTED_MODULE_8__[\"QUERY_URL\"], Object(_queries__WEBPACK_IMPORTED_MODULE_10__[\"makeQueryPortrayal\"])(result.geovizcomponent.value));\n    const res_list = gvr_results.results.bindings; // We want to build an array containing all the necessary informations\n    // to create the corresponding OL VectorLayers\n\n    const portrayals = []; // We compute the set of unique symbolizer at a given scale\n\n    const portrayal_uniques = new Set(res_list.map(d => [d.symbolizer.value, getValue(d, 'minScale', ''), getValue(d, 'maxScale', ''), getValue(d, 'displayIndex', '')].join('|'))); // Actually build the `portrayals` array\n\n    portrayal_uniques.forEach(v => {\n      let [symbolizerId, minValidScale, maxValidScale, displayIndex] = v.split('|');\n\n      if (minValidScale === '' && maxValidScale === '') {\n        minValidScale = null;\n        maxValidScale = null;\n      }\n\n      if (displayIndex === '') {\n        displayIndex = null;\n      }\n\n      const this_portrayal = res_list.filter(d => d.symbolizer.value === symbolizerId && getValue(d, 'minScale') === minValidScale && getValue(d, 'maxScale') === maxValidScale && getValue(d, 'displayIndex') === displayIndex);\n      const res_item = {}; // All the geometries for this portrayal\n\n      res_item.geometries = [...new Set(this_portrayal.map(d => d.geom.value))];\n      res_item.ids = [...new Set(this_portrayal.map(d => d.gvr.value))]; // Compute the z-index from the displayIndex if any\n\n      if (displayIndex) {\n        res_item.zIndex = 1001 - +displayIndex;\n      } // Handle the scale value if any\n\n\n      if (minValidScale && maxValidScale) {\n        res_item.scaleRange = [+minValidScale, +maxValidScale];\n      } // Each portrayal can now be matched with its symboliser\n      // (which describes the graphic properties to use: fill, stroke, etc.)\n\n\n      const namePortrayal = this_portrayal[0].symbolizer.value;\n      const type_symbolizer = this_portrayal[0].typeSymbolizer.value.replace(_consts__WEBPACK_IMPORTED_MODULE_8__[\"NS_SYMBOLIZER\"], ''); // Does the features of this symolizer allow the identify interaction ?\n\n      const allowsIdentify = !!getValue(this_portrayal[0], 'identify', false);\n      res_item.allowsIdentify = allowsIdentify; // ...\n\n      res_item[namePortrayal] = {\n        type: type_symbolizer\n      };\n      this_portrayal.forEach(el => {\n        const style_prop_iri = el.whatProp.value;\n        const style_prop_name = style_prop_iri.replace(_consts__WEBPACK_IMPORTED_MODULE_8__[\"NS_GRAPHIC\"], '');\n        res_item[namePortrayal][style_prop_name] = {};\n        this_portrayal.filter(d => d.whatProp.value === style_prop_iri).forEach(r => {\n          const prop_iri = r.prop2.value;\n          const prop_name = prop_iri.replace(_consts__WEBPACK_IMPORTED_MODULE_8__[\"NS_GRAPHIC\"], '');\n          res_item[namePortrayal][style_prop_name][prop_name] = r.value.value;\n        });\n      });\n      portrayals.push(res_item);\n    });\n    portrayals.forEach(portr => {\n      const k_styles = Object.keys(portr).filter(e => e.indexOf('Symbolizer') > -1);\n      k_styles.forEach(k_style => {\n        const features = portr.geometries.map(geom => wktFormat.readFeature(geom, {\n          dataProjection: 'EPSG:4326',\n          featureProjection: 'EPSG:3857'\n        })); // Set the id of each ol features as the id of\n        // the gviz:Portrayal it instanciate\n\n        features.forEach((ft, i) => {\n          ft.setId(portr.ids[i]);\n          ft.setProperties({\n            _allowsIdentify: portr.allowsIdentify\n          });\n        });\n        const styleObject = Object(_style__WEBPACK_IMPORTED_MODULE_11__[\"default\"])(portr[k_style]);\n        const style = portr.scaleRange === undefined ? styleObject : (ft, reso) => {\n          if (reso < getResoFromScale(portr.scaleRange[0]) && reso > getResoFromScale(portr.scaleRange[1])) {\n            return styleObject;\n          }\n\n          return null;\n        };\n        const layer = new ol_layer__WEBPACK_IMPORTED_MODULE_5__[\"Vector\"]({\n          source: new ol_source__WEBPACK_IMPORTED_MODULE_6__[\"Vector\"]({\n            features\n          }),\n          style\n        });\n\n        if (portr.zIndex) {\n          layer.setZIndex(portr.zIndex);\n        }\n\n        map.addLayer(layer);\n      });\n    });\n    console.log(gva_context_results, gvr_results, portrayals, map); // Do we need to build a legend ?\n\n    const result_legend = await Object(_queries__WEBPACK_IMPORTED_MODULE_10__[\"reqQuery\"])(_consts__WEBPACK_IMPORTED_MODULE_8__[\"QUERY_URL\"], Object(_queries__WEBPACK_IMPORTED_MODULE_10__[\"makeQueryLegend\"])(result.geovizcomponent.value));\n\n    if (result_legend.results.bindings.length) {\n      // There is a legend linked to this map\n      Object(_legend__WEBPACK_IMPORTED_MODULE_12__[\"default\"])(map, res_list, portrayals);\n    } // Bind it anyway, the fact that it allows identify is verified later\n\n\n    Object(_interactions__WEBPACK_IMPORTED_MODULE_9__[\"bindIdentify\"])(map);\n    return map;\n  });\n};\n\nwindow.onload = onload;\n\n//# sourceURL=webpack:///./src/js/app.js?");

/***/ }),

/***/ "./src/js/consts.js":
/*!**************************!*\
  !*** ./src/js/consts.js ***!
  \**************************/
/*! exports provided: QUERY_URL, UPDATE_URL, NS_SYMBOLIZER, NS_GRAPHIC */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"QUERY_URL\", function() { return QUERY_URL; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"UPDATE_URL\", function() { return UPDATE_URL; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"NS_SYMBOLIZER\", function() { return NS_SYMBOLIZER; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"NS_GRAPHIC\", function() { return NS_GRAPHIC; });\n// We declare a few constants, from the URL of the endpoint\n// to the namespaces that we're going to handle in JS code\nconst QUERY_URL = `${window.location.origin}/CoViKoa/query`;\nconst UPDATE_URL = `${window.location.origin}/CoViKoa/update`;\nconst NS_SYMBOLIZER = 'https://gis.lu.se/ont/data_portrayal/symbolizer#';\nconst NS_GRAPHIC = 'https://gis.lu.se/ont/data_portrayal/graphic#';\n\n//# sourceURL=webpack:///./src/js/consts.js?");

/***/ }),

/***/ "./src/js/helpers.js":
/*!***************************!*\
  !*** ./src/js/helpers.js ***!
  \***************************/
/*! exports provided: extractFeatureProperties */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"extractFeatureProperties\", function() { return extractFeatureProperties; });\n/**\n *\n *\n *\n *\n */\nconst extractFeatureProperties = ft => {\n  const properties = ft.getProperties();\n  const newProperties = Object.keys(properties).filter(k => !['_hasProperties', 'geometry', '_allowsIdentify'].includes(k)).map(k => {\n    const d = {\n      propertyName: k.startsWith('http') ? makePropertyName(k) : k,\n      propertyIRI: k,\n      value: properties[k]\n    };\n    return d;\n  });\n  return newProperties;\n};\n\nconst makePropertyName = name => {\n  let newName;\n  const ix1 = name.lastIndexOf('#');\n  const ix2 = name.lastIndexOf('/');\n\n  if (ix1 > -1 && ix1 > ix2) {\n    newName = name.slice(ix1 + 1);\n  } else if (ix2 > -1) {\n    newName = name.slice(ix2 + 1);\n  }\n\n  return newName;\n};\n\n//# sourceURL=webpack:///./src/js/helpers.js?");

/***/ }),

/***/ "./src/js/interactions.js":
/*!********************************!*\
  !*** ./src/js/interactions.js ***!
  \********************************/
/*! exports provided: bindIdentify, bindOtherInteraction */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"bindIdentify\", function() { return bindIdentify; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"bindOtherInteraction\", function() { return bindOtherInteraction; });\n/* harmony import */ var _consts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./consts */ \"./src/js/consts.js\");\n/* harmony import */ var _queries__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./queries */ \"./src/js/queries.js\");\n/* harmony import */ var _popup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./popup */ \"./src/js/popup.js\");\n/**\n* To store and instanciate the interactions\n* that might have been defined in the derivation model\n*\n*/\n\n\n\nconst bindIdentify = map => {\n  map.on('singleclick', async e => {\n    const coords = e.coordinate;\n    let ft;\n    map.forEachFeatureAtPixel(e.pixel, feature => {\n      if (ft) return;\n      ft = feature;\n    }, {\n      hitTolerance: 2\n    });\n\n    if (ft) {\n      // A feature was hit ...\n      // Does it allow identify interaction ?\n      if (!ft.get('_allowsIdentify')) return;\n\n      if (!ft.get('_hasProperties')) {\n        // The feature wasnt already enriched ...\n        const id = ft.getId();\n        const query = Object(_queries__WEBPACK_IMPORTED_MODULE_1__[\"makeQueryDataIndividual\"])(id);\n        const queryResult = await Object(_queries__WEBPACK_IMPORTED_MODULE_1__[\"reqQuery\"])(_consts__WEBPACK_IMPORTED_MODULE_0__[\"QUERY_URL\"], query);\n        const properties = {\n          _hasProperties: true\n        };\n        queryResult.results.bindings.forEach(d => {\n          properties[d.p.value] = d.v.value;\n        }); // Enrich the feature so that a future click doesnt trigger the query again..\n\n        ft.setProperties(properties);\n        Object(_popup__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(map, ft, coords);\n      } else {\n        // Feature was already enriched so we can dsplay the infobox directly\n        Object(_popup__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(map, ft, coords);\n      }\n    }\n  });\n};\nconst bindOtherInteraction = () => null;\n\n//# sourceURL=webpack:///./src/js/interactions.js?");

/***/ }),

/***/ "./src/js/legend.js":
/*!**************************!*\
  !*** ./src/js/legend.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _css_legend_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/legend.css */ \"./src/css/legend.css\");\n/* harmony import */ var _css_legend_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_legend_css__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var ol_ext_legend_Legend__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ol-ext/legend/Legend */ \"./node_modules/ol-ext/legend/Legend.js\");\n/* harmony import */ var ol_ext_control_Legend__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ol-ext/control/Legend */ \"./node_modules/ol-ext/control/Legend.js\");\n/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./style */ \"./src/js/style.js\");\n\n\n\n\n\nconst makeLegend = (map, res_list, portrayals) => {\n  // Extract the informations to build the legend...\n  const tempSymb = {};\n  res_list.forEach(r => {\n    if (tempSymb[r.labelSymbolization.value] !== undefined) {\n      tempSymb[r.labelSymbolization.value].add(JSON.stringify([r.labelSymbolizer.value, r.symbolizer.value]));\n    } else {\n      tempSymb[r.labelSymbolization.value] = new Set([JSON.stringify([r.labelSymbolizer.value, r.symbolizer.value])]);\n    }\n  });\n  const legendItems = [];\n  Object.keys(tempSymb).forEach(titleGroup => {\n    const resGroup = {\n      title: titleGroup,\n      elements: []\n    };\n    [...tempSymb[titleGroup]].forEach(el => {\n      const [value, symbolizer] = JSON.parse(el);\n      const o = portrayals.find(d => d[symbolizer])[symbolizer];\n      resGroup.elements.push({\n        symbolizer: o,\n        text: value\n      });\n    });\n    legendItems.push(resGroup);\n  }); // Build the legend\n\n  legendItems.forEach(legendItem => {\n    const legend = new ol_ext_legend_Legend__WEBPACK_IMPORTED_MODULE_1__[\"default\"]({\n      title: legendItem.title,\n      margin: 5\n    });\n    const legendCtrl = new ol_ext_control_Legend__WEBPACK_IMPORTED_MODULE_2__[\"default\"]({\n      legend,\n      collapsed: false\n    });\n    map.addControl(legendCtrl);\n    legendItem.elements.forEach(elem => {\n      legend.addItem({\n        title: elem.text,\n        typeGeom: 'Polygon',\n        style: Object(_style__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(elem.symbolizer)\n      });\n    });\n  });\n};\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (makeLegend);\n\n//# sourceURL=webpack:///./src/js/legend.js?");

/***/ }),

/***/ "./src/js/popup.js":
/*!*************************!*\
  !*** ./src/js/popup.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return displayPopup; });\n/* harmony import */ var _css_popup_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/popup.css */ \"./src/css/popup.css\");\n/* harmony import */ var _css_popup_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_popup_css__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var ol_Overlay__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ol/Overlay */ \"./node_modules/ol/Overlay.js\");\n/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers */ \"./src/js/helpers.js\");\n\n\n\n/**\n * Get the elements necessary to manipulate the popup\n * that displays information about a feature\n *\n * @param {string} map A reference to the map\n * @returns {object} An object with 4 members (container, content, closer and overlay)\n */\n\nconst getPopupElements = (() => {\n  let innerElements;\n  return map => {\n    if (!innerElements) {\n      const _container = document.createElement('div');\n\n      _container.id = 'popup';\n      _container.classList = ['ol-popup'];\n      _container.innerHTML = `\n    <a href=\"#\" id=\"popup-closer\" class=\"ol-popup-closer\"></a>\n    <div id=\"popup-content\"></div>\n      `;\n      document.body.appendChild(_container);\n\n      const _content = _container.querySelector('#popup-content');\n\n      const _closer = _container.querySelector('#popup-closer');\n\n      const _overlay = new ol_Overlay__WEBPACK_IMPORTED_MODULE_1__[\"default\"]({\n        element: _container,\n        autoPan: true,\n        autoPanAnimation: {\n          duration: 250\n        }\n      });\n\n      map.addOverlay(_overlay);\n\n      _closer.onclick = () => {\n        _overlay.setPosition(undefined);\n\n        _closer.blur();\n\n        return false;\n      };\n\n      innerElements = {\n        container: _container,\n        content: _content,\n        closer: _closer,\n        overlay: _overlay\n      };\n    }\n\n    return innerElements;\n  };\n})();\n/**\n * Display the popup that will contain the properties\n * of the given `ft` on the given `map` at the given `coords`.\n *\n * @param {}\n * @param {}\n * @param {}\n * @returns {void}\n */\n\n\nconst displayPopup = (map, ft, coords) => {\n  // Format the values to be displayed\n  const propertiesToRender = Object(_helpers__WEBPACK_IMPORTED_MODULE_2__[\"extractFeatureProperties\"])(ft); // Get a reference to the popup element\n\n  const {\n    content,\n    overlay\n  } = getPopupElements(map); // Create the table of property-value pairs\n  // with the full IRI of the property displayable when hovering over\n  // its short name...\n\n  content.innerHTML = `\n<p class=\"uri-feature\"><a href=\"${ft.getId()}\">${ft.getId()}</a></p>\n<table class=\"table-info\">\n  <tbody>\n${propertiesToRender.map(d => `<tr><td title=\"${d.propertyIRI}\" class=\"field-name\"><span>${d.propertyName}</td><td><span class=\"field-value\">${d.value}</span></td></tr>`).join('')}\n  </tbody>\n</table>`; // Display the popup on the map so that it will follow\n  // the clicked coordinates when panning\n\n  overlay.setPosition(coords);\n};\n\n\n\n//# sourceURL=webpack:///./src/js/popup.js?");

/***/ }),

/***/ "./src/js/queries.js":
/*!***************************!*\
  !*** ./src/js/queries.js ***!
  \***************************/
/*! exports provided: queryContextGVA, makeQueryLegend, makeQueryPortrayal, makeQueryDataIndividual, reqQuery, reqUpdate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"queryContextGVA\", function() { return queryContextGVA; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"makeQueryLegend\", function() { return makeQueryLegend; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"makeQueryPortrayal\", function() { return makeQueryPortrayal; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"makeQueryDataIndividual\", function() { return makeQueryDataIndividual; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"reqQuery\", function() { return reqQuery; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"reqUpdate\", function() { return reqUpdate; });\n// First query is to get informations about the GeoVisualComponent(s)\n// and their possible initial context\nconst queryContextGVA = `\nprefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nprefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>\nprefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nprefix geo: <http://www.opengis.net/ont/geosparql#>\nprefix geof: <http://www.opengis.net/def/function/geosparql/>\nprefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\nprefix cvc: <http://lig-tdcge.imag.fr/steamer/covikoa/context#>\nprefix owl: <http://www.w3.org/2002/07/owl#>\n\nSELECT DISTINCT ?geovizcomponent ?app ?w ?h ?geomInitialExtent ?basemapTemplateUrl ?basemapAttribution\nWHERE {\n#  ?protoapp a owl:Class ;\n#     rdfs:subClassOf gviz:GeoVisualApplication .\n#  FILTER(?protoapp != gviz:GeoVisualApplication).\n  ?app gviz:hasGeoVisualComponent ?geovizcomponent .\n  ?geovizcomponent a gviz:Map2dComponent .\n\n  OPTIONAL {\n    ?app cvc:hasVisualisationContext ?context .\n    ?context a cvc:VisualisationContext ;\n               cvc:hasMap [ owl:sameAs ?geovizcomponent ;\n                 cvc:widthPx ?w ;\n                 cvc:heightPx ?h ;\n                ] .\n    #OPTIONAL {\n    #  ?context cvc:hasUserContext [\n    #    cvc:hasColorVisionDeficiency ?coldef ;\n    #  ] .\n    #}\n    OPTIONAL {\n      ?context a cvc:VisualisationContext ;\n                 cvc:hasMap [ owl:sameAs ?geovizcomponent ;\n                    cvc:mapExtent [ geo:asWKT ?geomInitialExtent ] ;\n                 ] .\n    }\n    OPTIONAL {\n      ?context cvc:hasMap [ owl:sameAs ?geovizcomponent ;\n                    cvc:hasBaseMap [\n                      cvc:templateUrl ?basemapTemplateUrl ;\n                      cvc:attribution ?basemapAttribution ;\n                    ] ;\n                 ] .\n    }\n  }\n}\n`;\nconst makeQueryLegend = mapComponentUri => `\nprefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nprefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>\n\nSELECT *\nWHERE {\n  ?legendcomponent a gviz:LegendComponent ;\n                   gviz:linkedTo <${mapComponentUri}> .\n}`; // Returns a parametrized query for a given GeoVisualComponent\n// allowing to fetch all the necessary informations to\n// build the portrayals this component should display\n\nconst makeQueryPortrayal = mapComponentUri => `\nprefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nprefix ex:  <http://example.com/ns#>\nprefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>\nprefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nprefix geo: <http://www.opengis.net/ont/geosparql#>\nprefix geof: <http://www.opengis.net/def/function/geosparql/>\nprefix graphic: <https://gis.lu.se/ont/data_portrayal/graphic#>\nprefix symbolizer: <https://gis.lu.se/ont/data_portrayal/symbolizer#>\nprefix scale: <https://gis.lu.se/ont/visualisation_scale#>\n\nSELECT ?gvr ?geom ?displayIndex ?p ?symbolizer ?typeSymbolizer ?prop1 ?whatProp ?prop2 ?value ?minScale ?maxScale ?labelSymbolizer ?labelSymbolization ?identify\nWHERE {\n  #<${mapComponentUri}> gviz:presentsGVR ?gvr .\n  ?gvr gviz:hasPortrayal ?p .\n  ?p gviz:appearsIn <${mapComponentUri}> .\n  ?p gviz:hasPortrayalSymbolizer ?symbolizer .\n\n  # We want to know if the symbolizer is a (Point|Line|Polygon)Symbolizer\n  ?symbolizer a ?typeSymbolizer .\n  ?typeSymbolizer rdfs:subClassOf symbolizer:Symbolizer .\n  FILTER(?typeSymbolizer != symbolizer:Symbolizer) .\n\n  # Fetch display index and scale values if any\n  OPTIONAL {\n    ?p gviz:displayIndex ?displayIndex .\n  }\n  OPTIONAL {\n    ?p scale:hasScale [\n        scale:hasMinScaleDenominator ?minScale ;\n        scale:hasMaxScaleDenominator ?maxScale ;\n    ] .\n  }\n\n  # Transformed geometry or original geometry ?\n  OPTIONAL {\n    ?p geo:hasGeometry [geo:asWKT ?geomNew] .\n  }\n  OPTIONAL {\n    ?gvr gviz:represents [ geo:hasGeometry [geo:asWKT ?geomOrigin] ] .\n  }\n  BIND(IF(BOUND(?geomNew), ?geomNew, ?geomOrigin) AS ?geom)\n\n  # We want all the graphic properties of the symbolizer\n  OPTIONAL {\n     ?symbolizer ?prop1 [ a ?whatProp ; ?prop2 ?value ] .\n      FILTER(\n         STRSTARTS(STR(?prop1), STR(graphic:))\n         && STRSTARTS(STR(?prop2), STR(graphic:))\n         && STRSTARTS(STR(?whatProp), STR(graphic:))\n      )\n      FILTER(!STRSTARTS(STR(?whatProp), \"https://gis.lu.se/ont/data_portrayal/graphic#Graphic\"))\n  }\n\n  OPTIONAL {\n    ?symbolizer rdfs:label ?labelSymbolizer .\n  }\n  ?symb <https://gis.lu.se/ont/data_portrayal/symbolizer#hasSymbolizer> ?symbolizer .\n  OPTIONAL {\n    ?symb rdfs:label ?labelSymbolization .\n  }\n  OPTIONAL {\n    ?symb gviz:allowsInteraction gviz:identify .\n    BIND(true as ?identify).\n  }\n} ORDER BY ?displayIndex ?symbolizer\n`; // Returns a parametrized query for a given GeoVisualIntermediateRepresentation\n// allowing to fetch all the data from the individual it represents\n\nconst makeQueryDataIndividual = gvrIri => `\nprefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nprefix ex:  <http://example.com/ns#>\nprefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>\nprefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nprefix geo: <http://www.opengis.net/ont/geosparql#>\nprefix geof: <http://www.opengis.net/def/function/geosparql/>\nprefix graphic: <https://gis.lu.se/ont/data_portrayal/graphic#>\nprefix symbolizer: <https://gis.lu.se/ont/data_portrayal/symbolizer#>\nprefix scale: <https://gis.lu.se/ont/visualisation_scale#>\n\nSELECT ?indiv ?p ?v\nWHERE {\n  <${gvrIri}> gviz:represents ?indiv .\n  ?indiv ?p ?v .\n  FILTER(isLiteral(?v)) .\n}\n`; // Query the SPARQL endpoint and get the deserialized result\n\nconst reqQuery = (url, content) => fetch(url, {\n  method: 'POST',\n  body: `query=${encodeURIComponent(content)}`,\n  headers: {\n    'Content-Type': 'application/x-www-form-urlencoded'\n  },\n  mode: 'no-cors'\n}).then(res => res.json());\nconst reqUpdate = (url, content) => fetch(url, {\n  method: 'POST',\n  body: `update=${encodeURIComponent(content)}`,\n  headers: {\n    'Content-Type': 'application/x-www-form-urlencoded'\n  },\n  mode: 'no-cors'\n}).then(res => res.text());\n\n//# sourceURL=webpack:///./src/js/queries.js?");

/***/ }),

/***/ "./src/js/style.js":
/*!*************************!*\
  !*** ./src/js/style.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var ol_style__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ol/style */ \"./node_modules/ol/style.js\");\n // Given an Object containing the graphic properties\n// in Symbolizer/Graphic vocabularies, transform it to\n// a `Style` object from OpenLayers\n\nconst makeStyle = s => {\n  const keys = Object.keys(s);\n  let inner_style = {};\n\n  if (['PointSymbolizer', 'LineSymbolizer', 'PolygonSymbolizer'].indexOf(s.type) > -1) {\n    keys.forEach(k => {\n      if (k === 'Fill') {\n        const fill_props = Object.keys(s[k]);\n        const inner_fill_style = {};\n        fill_props.forEach(p => {\n          if (p === 'fillColor') {\n            inner_fill_style.color = s[k][p];\n          }\n        });\n        inner_style.fill = new ol_style__WEBPACK_IMPORTED_MODULE_0__[\"Fill\"](inner_fill_style);\n      } else if (k === 'Stroke') {\n        const stroke_props = Object.keys(s[k]);\n        const inner_stroke_style = {};\n        stroke_props.forEach(p => {\n          if (p === 'strokeColor') {\n            inner_stroke_style.color = s[k][p];\n          } else if (p === 'strokeWidth') {\n            inner_stroke_style.width = s[k][p];\n          } else if (p === 'strokeDashArray') {\n            inner_stroke_style.lineDash = s[k][p].split(' ').map(d => +d);\n          } else if (p === 'strokeDashOffset') {\n            inner_stroke_style.lineDashOffset = +s[k][p];\n          } else if (p === 'strokeLineCap') {\n            const value = s[k][p];\n\n            if (['butt', 'round', 'square'].indexOf(value) > -1) {\n              inner_stroke_style.lineCap = value;\n            }\n          } else if (p === 'strokeLineJoin') {\n            const value = s[k][p];\n\n            if (['bevel', 'round', 'miter'].indexOf(value) > -1) {\n              inner_stroke_style.lineCap = value;\n            }\n          }\n        });\n        inner_style.stroke = new ol_style__WEBPACK_IMPORTED_MODULE_0__[\"Stroke\"](inner_stroke_style);\n      }\n    }); // Handle the shape expected for PointSymbolizer (only Circle for now)\n\n    if (keys.some(el => el === 'Shape') && keys.some(el => el === 'Circle')) {\n      inner_style.radius = s.Circle.radius;\n      inner_style = {\n        image: new ol_style__WEBPACK_IMPORTED_MODULE_0__[\"Circle\"](inner_style)\n      };\n    }\n  } else {\n    throw new Error('TextSymbolizer are not currently supported');\n  }\n\n  return new ol_style__WEBPACK_IMPORTED_MODULE_0__[\"Style\"](inner_style);\n};\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (makeStyle);\n\n//# sourceURL=webpack:///./src/js/style.js?");

/***/ })

/******/ });