import Map from 'ol/Map';
import View from 'ol/View';
// import Attribution from 'ol/control/Attribution';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, XYZ } from 'ol/source';
import Synchronize from 'ol-ext/interaction/Synchronize';
import { NS_GRAPHIC, NS_SYMBOLIZER } from './consts';
import { getResoFromScale, getValue, wktFormat } from './helpers';
import makeStyle from './style';

export const makeMapElement = (map_param) => {
  const mapElement = document.createElement('div');
  mapElement.setAttribute('iri', map_param.geovizcomponent.value);
  mapElement.className = 'ol-map';
  if (map_param.w && map_param.w.value) {
    mapElement.style.width = `${map_param.w.value}px`;
  }
  if (map_param.h && map_param.h.value) {
    mapElement.style.height = `${map_param.h.value}px`;
  }
  document.body.appendChild(mapElement);

  let baseMapLayer;
  if (map_param.basemapTemplateUrl && map_param.basemapAttribution) {
    baseMapLayer = new TileLayer({
      source: new XYZ({
        url: map_param.basemapTemplateUrl.value,
        attributions: [map_param.basemapAttribution.value],
      }),
    });
  } else {
    baseMapLayer = new TileLayer({
      source: new XYZ({
        url: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
        attributions: ['Map data: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org/">SRTM</a> | Map style: © <a href="https://opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'],
      }),
    });
  }

  const view = new View({
    center: [0, 0],
    zoom: 3,
  });

  // Compute the zoom and the center from `map_param.geomInitialExtent.value`,
  // if existing, which is the expected WKT extent .
  if (map_param.geomInitialExtent && map_param.geomInitialExtent.value) {
    const feature = wktFormat.readFeature(map_param.geomInitialExtent.value, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    const geom = feature.getGeometry();
    view.fit(geom);
  }

  return new Map({
    layers: [
      baseMapLayer,
    ],
    target: mapElement,
    view,
  });
};

export const handleMapSynchronisation = (maps, mapParams) => {
  for (let i = 0; i < maps.length; i++) {
    if (mapParams[i].otherGvc && mapParams[i].otherGvc.value) {
      const map = maps[i];
      const iriOtherMap = mapParams[i].otherGvc.value;
      global.State.maps.forEach((_map) => {
        if (_map.getTarget().getAttribute('iri') === iriOtherMap) {
          map.addInteraction(new Synchronize({ maps: [_map] }));
        }
      });
    }
  }
};

export const makeLayerAndPortrayal = (res_list, map) => {
  // We want to build an array containing all the necessary informations
  // to create the corresponding OL VectorLayers
  const portrayals = [];

  // We compute the set of unique symbolizer at a given scale
  const portrayal_uniques = new Set(
    res_list.map((d) => [
      d.symbolizer.value,
      getValue(d, 'minScale', ''),
      getValue(d, 'maxScale', ''),
      getValue(d, 'displayIndex', ''),
    ].join('|')),
  );
  // Actually build the `portrayals` array
  portrayal_uniques.forEach((v) => {
    let [symbolizerId, minValidScale, maxValidScale, displayIndex] = v.split('|');
    if (minValidScale === '' && maxValidScale === '') {
      minValidScale = null;
      maxValidScale = null;
    }
    if (displayIndex === '') {
      displayIndex = null;
    }
    const this_portrayal = res_list.filter(
      (d) => (d.symbolizer.value === symbolizerId
        && getValue(d, 'minScale') === minValidScale
        && getValue(d, 'maxScale') === maxValidScale
        && getValue(d, 'displayIndex') === displayIndex),
    );

    const res_item = {};
    // All the geometries for this portrayal
    res_item.geometries = [...new Set(this_portrayal.map((d) => d.geom.value))];

    res_item.ids = [...new Set(this_portrayal.map((d) => d.gvr.value))];

    // Compute the z-index from the displayIndex if any
    if (displayIndex) {
      res_item.zIndex = 1001 - +displayIndex;
    }

    // Handle the scale value if any
    if (minValidScale && maxValidScale) {
      res_item.scaleRange = [+minValidScale, +maxValidScale];
    }
    // Each portrayal can now be matched with its symboliser
    // (which describes the graphic properties to use: fill, stroke, etc.)
    const namePortrayal = this_portrayal[0].symbolizer.value;
    const type_symbolizer = this_portrayal[0].typeSymbolizer.value
      .replace(NS_SYMBOLIZER, '');

    // Does the features of this symolizer allow the identify interaction ?
    const allowsIdentify = !!getValue(this_portrayal[0], 'identify', false);
    res_item.allowsIdentify = allowsIdentify;

    // ...
    res_item[namePortrayal] = { type: type_symbolizer };

    this_portrayal.forEach((el) => {
      const style_prop_iri = el.whatProp.value;
      const style_prop_name = style_prop_iri.replace(NS_GRAPHIC, '');
      res_item[namePortrayal][style_prop_name] = {};
      this_portrayal.filter((d) => d.whatProp.value === style_prop_iri).forEach((r) => {
        const prop_iri = r.prop2.value;
        const prop_name = prop_iri.replace(NS_GRAPHIC, '');
        res_item[namePortrayal][style_prop_name][prop_name] = r.value.value;
      });
    });
    portrayals.push(res_item);
  });

  portrayals.forEach((portr) => {
    const k_styles = Object.keys(portr).filter((e) => e.indexOf('Symbolizer') > -1);
    k_styles.forEach((k_style) => {
      const features = portr.geometries.map((geom) => wktFormat.readFeature(geom, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }));

      // Set the id of each ol features as the id of
      // the gviz:Portrayal it instanciate
      features.forEach((ft, i) => {
        ft.setId(portr.ids[i]);
        ft.setProperties({ _allowsIdentify: portr.allowsIdentify });
      });

      const styleObject = makeStyle(portr[k_style]);
      const style = portr.scaleRange === undefined
        ? styleObject
        : (ft, reso) => {
          if (
            reso < getResoFromScale(portr.scaleRange[0])
            && reso > getResoFromScale(portr.scaleRange[1])
          ) {
            return styleObject;
          }
          return null;
        };

      const layer = new VectorLayer({
        source: new VectorSource({ features }),
        style,
      });

      if (portr.zIndex) {
        layer.setZIndex(portr.zIndex);
      }
      map.addLayer(layer);
    });
  });
  return portrayals;
};
