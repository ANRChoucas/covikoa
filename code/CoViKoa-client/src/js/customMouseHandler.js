import { BasicMouseHandler } from '@lumino/datagrid';
import { Vector as VectorLayer } from 'ol/layer';
import { makePrefixName } from './helpers';
import {
  Circle as CircleStyle, Text,
  RegularShape, Fill, Stroke, Style, Icon,
} from 'ol/style';

/**
* This is the custom MouseHandler for the DataGrid that allows to
* register/trigger interactions on our TableWidget.
*
*/
export default class CustomMouseHandler extends BasicMouseHandler {
  constructor(/* grid */) { // eslint-disable-line no-useless-constructor
    super();
    // this._grid = grid;
  }

  onMouseDown(grid, event) {
    const hit = grid.hitTest(event.clientX, event.clientY);

    // see grid.dataModel.data(region, row, column) which might be safer (regarding to reordering)
    // to get a single value
    let idFeatureClicked; // we dont allow to reorder the table for now...
    let feature;
    if (hit.region === 'row-header') {
      idFeatureClicked = hit.row;
    } else if (hit.region === 'body') {
      idFeatureClicked = hit.row;
    }

    // Find the corresponding feature on the map ...
    if (idFeatureClicked) {
      const dataFeature = grid.dataModel._data[idFeatureClicked];
      const iriFeature = dataFeature.iri;
      // TODO: use InteractionDescriptor for the following
      global.State.maps[0].olMap.getLayers().array_.forEach((layer) => {
        if (!(layer instanceof VectorLayer)) return;
        layer.getSource().getFeatures().forEach((f) => {
          if (makePrefixName(f.getProperties()['_idTargetIndividual']) === iriFeature) {
            feature = f;
          }
        });
      });
    }

    if (feature && !feature._highlighted) {
      // A feature has been found and is not already in highlight state...
      const oldStyle = feature.getStyle();
      feature._highlighted = true;
      
      feature.setStyle(new Style({
        fill: new Fill({ color: 'rgba(121, 121, 12, 0.5)' }),
      }));
      setTimeout(() => {
        feature.setStyle(oldStyle);
        feature._highlighted = false;
      }, 5000);
    }

    super.onMouseDown(grid, event);
  }
}
