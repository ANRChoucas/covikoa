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

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src/index.js?!./src/css/styles.css":
/*!*************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src??postcss!./src/css/styles.css ***!
  \*************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\nexports = ___CSS_LOADER_API_IMPORT___(false);\n// Module\nexports.push([module.i, \".ol-map {\\n  width: 100%;\\n  height:400px;\\n}\\n\\nhtml {\\n  box-sizing: border-box;\\n  display: block;\\n}\\n\", \"\"]);\n// Exports\nmodule.exports = exports;\n\n\n//# sourceURL=webpack:///./src/css/styles.css?./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src??postcss");

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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _css_styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/styles.css */ \"./src/css/styles.css\");\n/* harmony import */ var _css_styles_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_styles_css__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var ol_ol_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ol/ol.css */ \"./node_modules/ol/ol.css\");\n/* harmony import */ var ol_ol_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(ol_ol_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var ol_Map__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ol/Map */ \"./node_modules/ol/Map.js\");\n/* harmony import */ var ol_View__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ol/View */ \"./node_modules/ol/View.js\");\n/* harmony import */ var ol_control_Attribution__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ol/control/Attribution */ \"./node_modules/ol/control/Attribution.js\");\n/* harmony import */ var ol_layer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ol/layer */ \"./node_modules/ol/layer.js\");\n/* harmony import */ var ol_source__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ol/source */ \"./node_modules/ol/source.js\");\n/* harmony import */ var ol_style__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ol/style */ \"./node_modules/ol/style.js\");\n/* harmony import */ var ol_format_WKT__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ol/format/WKT */ \"./node_modules/ol/format/WKT.js\");\n/* harmony import */ var _queries__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./queries */ \"./src/js/queries.js\");\n\n\n\n\n\n\n\n\n\n // We declare a few constants, from the URL of the endpoint\n// to the namespaces that we're going to handle in JS code\n\nconst QUERY_URL = `${window.location.origin}/CoViKoa/query`;\nconst UPDATE_URL = `${window.location.origin}/CoViKoa/update`;\nconst NS_SYMBOLIZER = 'https://gis.lu.se/ont/data_portrayal/symbolizer#';\nconst NS_GRAPHIC = 'https://gis.lu.se/ont/data_portrayal/graphic#';\nconst ONE_FEATURE_PER_LAYER = Symbol('ONE_FEATURE_PER_LAYER');\nconst ONE_SYMBOLISER_PER_LAYER = Symbol('ONE_SYMBOLISER_PER_LAYER');\nconst strategy = ONE_SYMBOLISER_PER_LAYER; // All the geometries will be fetched in WKT\n\nconst wktFormat = new ol_format_WKT__WEBPACK_IMPORTED_MODULE_8__[\"default\"]();\n\nconst getValue = (item, key, defaultValue = null) => item[key] && item[key].value ? item[key].value : defaultValue;\n\nconst getResoFromScale = (z, max_resolution = 40075016.68557849 / 256) => max_resolution / 2 ** z;\n\nconst makeMapElement = map_param => {\n  const mapElement = document.createElement('div');\n  mapElement.className = 'ol-map';\n\n  if (map_param.w && map_param.w.value) {\n    mapElement.style.width = `${map_param.w.value}px`;\n  }\n\n  if (map_param.h && map_param.h.value) {\n    mapElement.style.height = `${map_param.h.value}px`;\n  }\n\n  document.body.appendChild(mapElement);\n  const view = new ol_View__WEBPACK_IMPORTED_MODULE_3__[\"default\"]({\n    center: [0, 0],\n    zoom: 3\n  }); // Compute the zoom and the center from `map_param.geomInitialExtent.value`,\n  // if existing, which is the expected WKT extent .\n\n  if (map_param.geomInitialExtent && map_param.geomInitialExtent.value) {\n    const feature = wktFormat.readFeature(map_param.geomInitialExtent.value, {\n      dataProjection: 'EPSG:4326',\n      featureProjection: 'EPSG:3857'\n    });\n    const geom = feature.getGeometry();\n    view.fit(geom);\n  }\n\n  return new ol_Map__WEBPACK_IMPORTED_MODULE_2__[\"default\"]({\n    layers: [new ol_layer__WEBPACK_IMPORTED_MODULE_5__[\"Tile\"]({\n      source: new ol_source__WEBPACK_IMPORTED_MODULE_6__[\"XYZ\"]({\n        url: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',\n        attributions: ['© OpenStreetMap -Mitwirkende, SRTM | Affichage de la carte: © OpenTopoMap (CC-BY-SA)']\n      })\n    })],\n    target: mapElement,\n    view\n  });\n}; // Given an Object containing the graphic properties\n// in Symbolizer/Graphic vocabularies, transform it to\n// a `Style` object from OpenLayers\n\n\nconst makeStyle = s => {\n  const keys = Object.keys(s);\n  let inner_style = {};\n\n  if (['PointSymbolizer', 'LineSymbolizer', 'PolygonSymbolizer'].indexOf(s.type) > -1) {\n    keys.forEach(k => {\n      if (k === 'Fill') {\n        const fill_props = Object.keys(s[k]);\n        const inner_fill_style = {};\n        fill_props.forEach(p => {\n          if (p === 'fillColor') {\n            inner_fill_style.color = s[k][p];\n          }\n        });\n        inner_style.fill = new ol_style__WEBPACK_IMPORTED_MODULE_7__[\"Fill\"](inner_fill_style);\n      } else if (k === 'Stroke') {\n        const stroke_props = Object.keys(s[k]);\n        const inner_stroke_style = {};\n        stroke_props.forEach(p => {\n          if (p === 'strokeColor') {\n            inner_stroke_style.color = s[k][p];\n          } else if (p === 'strokeWidth') {\n            inner_stroke_style.width = s[k][p];\n          } else if (p === 'strokeDashArray') {\n            inner_stroke_style.lineDash = s[k][p].split(' ').map(d => +d);\n          } else if (p === 'strokeDashOffset') {\n            inner_stroke_style.lineDashOffset = +s[k][p];\n          } else if (p === 'strokeLineCap') {\n            const value = s[k][p];\n\n            if (['butt', 'round', 'square'].indexOf(value) > -1) {\n              inner_stroke_style.lineCap = value;\n            }\n          } else if (p === 'strokeLineJoin') {\n            const value = s[k][p];\n\n            if (['bevel', 'round', 'miter'].indexOf(value) > -1) {\n              inner_stroke_style.lineCap = value;\n            }\n          }\n        });\n        inner_style.stroke = new ol_style__WEBPACK_IMPORTED_MODULE_7__[\"Stroke\"](inner_stroke_style);\n      }\n    }); // Handle the shape expected for PointSymbolizer (only Circle for now)\n\n    if (keys.some(el => el === 'Shape') && keys.some(el => el === 'Circle')) {\n      inner_style.radius = s.Circle.radius;\n      inner_style = {\n        image: new ol_style__WEBPACK_IMPORTED_MODULE_7__[\"Circle\"](inner_style)\n      };\n    }\n  } else {\n    throw new Error('LineSymbolizer are not currently supported');\n  }\n\n  return new ol_style__WEBPACK_IMPORTED_MODULE_7__[\"Style\"](inner_style);\n};\n\nconst onload = async () => {\n  // Get information about the \"GeoVisualApplication\" and its component in the KB\n  // in order to create them\n  const gva_context_results = await Object(_queries__WEBPACK_IMPORTED_MODULE_9__[\"reqQuery\"])(QUERY_URL, _queries__WEBPACK_IMPORTED_MODULE_9__[\"queryContextGVA\"]);\n  const map = makeMapElement(gva_context_results.results.bindings[0]); // Get informations about the GeoVisualIntermediateRepresentation in the KB\n\n  const gvr_results = await Object(_queries__WEBPACK_IMPORTED_MODULE_9__[\"reqQuery\"])(QUERY_URL, Object(_queries__WEBPACK_IMPORTED_MODULE_9__[\"makeQueryPortrayal\"])(gva_context_results.results.bindings[0].geovizcomponent.value));\n  const res_list = gvr_results.results.bindings; // We want to build an array containing all the necessary informations\n  // to create the corresponding OL VectorLayers\n\n  const portrayals = [];\n\n  if (strategy === ONE_FEATURE_PER_LAYER) {\n    // We compute the set of unique portrayals based on\n    // the ID of the Intermediate Representation (gviz:GeoVisualIntermediateRepresentation)\n    // and the ID of the gviz:PortrayalOption\n    // because each individuals might have one or more gviz:PortrayalOption\n    // (and these gviz:PortrayalOption might describe a different geo:Geometry\n    // to be used depending on the scale of validity of the gviz:PortrayalOption).\n    const portrayal_uniques = new Set(res_list.map(d => [d.gvr.value, d.p.value].join('|'))); // Actually build the `portrayals` array\n\n    portrayal_uniques.forEach(v => {\n      const [item, portrayalId] = v.split('|');\n      const this_portrayal = res_list.filter(d => d.gvr.value === item && d.p.value === portrayalId);\n      const res_item = {\n        geometry: this_portrayal[0].geom.value\n      }; // Compute the z-index from the displayIndex\n\n      if (this_portrayal[0].displayIndex) {\n        res_item.zIndex = 1001 - +this_portrayal[0].displayIndex.value;\n      } // Handle the scale value if any\n\n\n      if (this_portrayal[0].minScale && this_portrayal[0].maxScale) {\n        res_item.scaleRange = [+this_portrayal[0].minScale.value, +this_portrayal[0].maxScale.value];\n      } // Each portrayal can now be matched with its symboliser\n      // (which describes the graphic properties to use: fill, stroke, etc.)\n\n\n      const symbz = this_portrayal[0].typeSymbolizer.value;\n      const type_portrayal = this_portrayal[0].o.value;\n      const type_symbolizer = symbz.replace(NS_SYMBOLIZER, '');\n      res_item[type_portrayal] = {\n        type: type_symbolizer\n      };\n      this_portrayal.forEach(el => {\n        const style_prop_iri = el.whatProp.value;\n        const style_prop_name = style_prop_iri.replace(NS_GRAPHIC, '');\n        res_item[type_portrayal][style_prop_name] = {};\n        this_portrayal.filter(d => d.whatProp.value === style_prop_iri).forEach(r => {\n          const prop_iri = r.prop2.value;\n          const prop_name = prop_iri.replace(NS_GRAPHIC, '');\n          res_item[type_portrayal][style_prop_name][prop_name] = r.value.value;\n        });\n      });\n      portrayals.push(res_item);\n    }); // Create the VectorLayer for each for these portrayal,\n    // taking care of activating it's style\n    // for the valid scale range\n\n    portrayals.forEach(portr => {\n      const k_styles = Object.keys(portr).filter(e => e.indexOf('Symbolizer') > -1);\n      k_styles.forEach(k_style => {\n        const feature = wktFormat.readFeature(portr.geometry, {\n          dataProjection: 'EPSG:4326',\n          featureProjection: 'EPSG:3857'\n        });\n        const styleLayer = makeStyle(portr[k_style]);\n        const styleValue = portr.scaleRange === undefined ? styleLayer : (ft, reso) => {\n          if (reso < getResoFromScale(portr.scaleRange[0]) && reso > getResoFromScale(portr.scaleRange[1])) {\n            return styleLayer;\n          }\n\n          return null;\n        };\n        const layer = new ol_layer__WEBPACK_IMPORTED_MODULE_5__[\"Vector\"]({\n          source: new ol_source__WEBPACK_IMPORTED_MODULE_6__[\"Vector\"]({\n            features: [feature]\n          }),\n          style: styleValue\n        });\n\n        if (portr.zIndex) {\n          layer.setZIndex(portr.zIndex);\n        }\n\n        map.addLayer(layer);\n      });\n    });\n  } else if (strategy === ONE_SYMBOLISER_PER_LAYER) {\n    // We compute the set of unique symbolizer at a given scale\n    const portrayal_uniques = new Set(res_list.map(d => [d.o.value, getValue(d, 'minScale', ''), getValue(d, 'maxScale', ''), getValue(d, 'displayIndex', '')].join('|'))); // Actually build the `portrayals` array\n\n    portrayal_uniques.forEach(v => {\n      let [symbolizerId, minValidScale, maxValidScale, displayIndex] = v.split('|');\n\n      if (minValidScale === '' && maxValidScale === '') {\n        minValidScale = null;\n        maxValidScale = null;\n      }\n\n      if (displayIndex === '') {\n        displayIndex = null;\n      }\n\n      const this_portrayal = res_list.filter(d => d.o.value === symbolizerId && getValue(d, 'minScale') === minValidScale && getValue(d, 'maxScale') === maxValidScale && getValue(d, 'displayIndex') === displayIndex);\n      const res_item = {}; // All the geometries for this portrayal\n\n      res_item.geometries = [...new Set(this_portrayal.map(d => d.geom.value))]; // Compute the z-index from the displayIndex if any\n\n      if (displayIndex) {\n        res_item.zIndex = 1001 - +displayIndex;\n      } // Handle the scale value if any\n\n\n      if (minValidScale && maxValidScale) {\n        res_item.scaleRange = [+minValidScale, +maxValidScale];\n      } // Each portrayal can now be matched with its symboliser\n      // (which describes the graphic properties to use: fill, stroke, etc.)\n\n\n      const namePortrayal = this_portrayal[0].o.value;\n      const type_symbolizer = this_portrayal[0].typeSymbolizer.value.replace(NS_SYMBOLIZER, '');\n      res_item[namePortrayal] = {\n        type: type_symbolizer\n      };\n      this_portrayal.forEach(el => {\n        const style_prop_iri = el.whatProp.value;\n        const style_prop_name = style_prop_iri.replace(NS_GRAPHIC, '');\n        res_item[namePortrayal][style_prop_name] = {};\n        this_portrayal.filter(d => d.whatProp.value === style_prop_iri).forEach(r => {\n          const prop_iri = r.prop2.value;\n          const prop_name = prop_iri.replace(NS_GRAPHIC, '');\n          res_item[namePortrayal][style_prop_name][prop_name] = r.value.value;\n        });\n      });\n      portrayals.push(res_item);\n    });\n    portrayals.forEach(portr => {\n      const k_styles = Object.keys(portr).filter(e => e.indexOf('Symbolizer') > -1);\n      k_styles.forEach(k_style => {\n        const features = portr.geometries.map(geom => wktFormat.readFeature(geom, {\n          dataProjection: 'EPSG:4326',\n          featureProjection: 'EPSG:3857'\n        }));\n        const styleLayer = makeStyle(portr[k_style]);\n        const style = portr.scaleRange === undefined ? styleLayer : (ft, reso) => {\n          if (reso < getResoFromScale(portr.scaleRange[0]) && reso > getResoFromScale(portr.scaleRange[1])) {\n            return styleLayer;\n          }\n\n          return null;\n        };\n        const layer = new ol_layer__WEBPACK_IMPORTED_MODULE_5__[\"Vector\"]({\n          source: new ol_source__WEBPACK_IMPORTED_MODULE_6__[\"Vector\"]({\n            features\n          }),\n          style\n        });\n\n        if (portr.zIndex) {\n          layer.setZIndex(portr.zIndex);\n        }\n\n        map.addLayer(layer);\n      });\n    });\n  }\n\n  console.log(gva_context_results, gvr_results, portrayals, map);\n};\n\nwindow.onload = onload;\n\n//# sourceURL=webpack:///./src/js/app.js?");

/***/ }),

/***/ "./src/js/queries.js":
/*!***************************!*\
  !*** ./src/js/queries.js ***!
  \***************************/
/*! exports provided: queryContextGVA, makeQueryPortrayal, reqQuery, reqUpdate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"queryContextGVA\", function() { return queryContextGVA; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"makeQueryPortrayal\", function() { return makeQueryPortrayal; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"reqQuery\", function() { return reqQuery; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"reqUpdate\", function() { return reqUpdate; });\n// First query is to get informations about the GeoVisualComponent(s)\n// and their possible initial context\nconst queryContextGVA = `\n  prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n  prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>\n  prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n  prefix geo: <http://www.opengis.net/ont/geosparql#>\n  prefix geof: <http://www.opengis.net/def/function/geosparql/>\n  prefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>\n  prefix cvc: <http://lig-tdcge.imag.fr/steamer/covikoa/context#>\n  prefix owl: <http://www.w3.org/2002/07/owl#>\n\n  SELECT *\n  WHERE {\n    ?protoapp a owl:Class ;\n       rdfs:subClassOf gviz:GeoVisualApplication .\n    FILTER(?protoapp != gviz:GeoVisualApplication).\n\n    ?app a ?protoapp ;\n      gviz:hasGeoVisualComponent ?geovizcomponent .\n    OPTIONAL {\n      ?app cvc:hasVisualisationContext ?context .\n      ?context a cvc:VisualisationContext ;\n                 cvc:hasMap [ owl:sameAs ?geovizcomponent ;\n                   cvc:widthPx ?w ;\n                   cvc:heightPx ?h ;\n                  ] .\n      OPTIONAL {\n        ?context cvc:hasUserContext [\n          cvc:hasColorVisionDeficiency ?coldef ;\n        ] .\n      }\n      OPTIONAL {\n        ?context a cvc:VisualisationContext ;\n                   cvc:hasMap [ owl:sameAs ?geovizcomponent ;\n                      cvc:mapExtent [ geo:asWKT ?geomInitialExtent ] ;\n                   ] .\n      }\n    }\n  }\n`; // Returns a parametrized query for a given GeoVisualComponent\n// allowing to fetch all the necessary informations to\n// build the portrayals this component should display\n\nconst makeQueryPortrayal = mapComponentUri => `\nprefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nprefix ex:  <http://example.com/ns#>\nprefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>\nprefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nprefix geo: <http://www.opengis.net/ont/geosparql#>\nprefix geof: <http://www.opengis.net/def/function/geosparql/>\nprefix graphic: <https://gis.lu.se/ont/data_portrayal/graphic#>\nprefix symbolizer: <https://gis.lu.se/ont/data_portrayal/symbolizer#>\nprefix scale: <https://gis.lu.se/ont/visualisation_scale#>\n\nSELECT ?gvr ?geom ?displayIndex ?p ?o ?typeSymbolizer ?prop1 ?whatProp ?prop2 ?value ?minScale ?maxScale\nWHERE {\n  <${mapComponentUri}> gviz:presentsGVR ?gvr .\n  ?gvr gviz:hasPortrayal ?p .\n  ?p gviz:hasPortrayalSymbolizer ?o .\n\n  # We want to know if the symbolizer is a (Point|Line|Polygon)Symbolizer\n  ?o a ?typeSymbolizer .\n  ?typeSymbolizer rdfs:subClassOf symbolizer:Symbolizer .\n  FILTER(?typeSymbolizer != symbolizer:Symbolizer) .\n\n  # Fetch display index and scale values if any\n  OPTIONAL {\n    ?p gviz:displayIndex ?displayIndex .\n  }\n  OPTIONAL {\n    ?p scale:hasScale [\n        scale:hasMinScaleDenominator ?minScale ;\n        scale:hasMaxScaleDenominator ?maxScale ;\n    ] .\n  }\n\n  # Transformed geometry or original geometry ?\n  OPTIONAL {\n    ?p geo:hasGeometry [geo:asWKT ?geomNew] .\n  }\n  OPTIONAL {\n    ?gvr gviz:represents [ geo:hasGeometry [geo:asWKT ?geomOrigin] ] .\n  }\n  BIND(IF(BOUND(?geomNew), ?geomNew, ?geomOrigin) AS ?geom)\n\n  # We want all the graphic properties of the symbolizer\n  OPTIONAL {\n     ?o ?prop1 [ a ?whatProp ; ?prop2 ?value ] .\n      FILTER(\n         STRSTARTS(STR(?prop1), STR(graphic:))\n         && STRSTARTS(STR(?prop2), STR(graphic:))\n         && STRSTARTS(STR(?whatProp), STR(graphic:))\n      )\n      FILTER(!STRSTARTS(STR(?whatProp), \"https://gis.lu.se/ont/data_portrayal/graphic#Graphic\"))\n  }\n} ORDER BY ?displayIndex\n`; // Query the SPARQL endpoint and get the deserialized result\n\nconst reqQuery = (url, content) => fetch(url, {\n  method: 'POST',\n  body: `query=${encodeURIComponent(content)}`,\n  headers: {\n    'Content-Type': 'application/x-www-form-urlencoded'\n  },\n  mode: 'no-cors'\n}).then(res => res.json());\nconst reqUpdate = (url, content) => fetch(url, {\n  method: 'POST',\n  body: `update=${encodeURIComponent(content)}`,\n  headers: {\n    'Content-Type': 'application/x-www-form-urlencoded'\n  },\n  mode: 'no-cors'\n}).then(res => res.text());\n\n//# sourceURL=webpack:///./src/js/queries.js?");

/***/ })

/******/ });