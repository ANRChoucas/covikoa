import '../css/legend.css';
import Legend from 'ol-ext/legend/Legend';
import ControlLegend from 'ol-ext/control/Legend';
import makeStyle from './style';

const makeLegend = (map, res_list, portrayals) => {
  // Extract the informations to build the legend...
  const tempSymb = {};
  res_list.forEach((r) => {
    if (tempSymb[r.labelSymbolization.value] !== undefined) {
      tempSymb[r.labelSymbolization.value].add(
        JSON.stringify([r.labelSymbolizer.value, r.symbolizer.value]),
      );
    } else {
      tempSymb[r.labelSymbolization.value] = new Set(
        [JSON.stringify([r.labelSymbolizer.value, r.symbolizer.value])],
      );
    }
  });

  const legendItems = [];
  Object.keys(tempSymb).forEach((titleGroup) => {
    const resGroup = { title: titleGroup, elements: [] };
    [...tempSymb[titleGroup]].forEach((el) => {
      const [value, symbolizer] = JSON.parse(el);
      const o = portrayals.find((d) => d[symbolizer])[symbolizer];
      resGroup.elements.push({ symbolizer: o, text: value });
    });
    legendItems.push(resGroup);
  });

  // Build the legend
  legendItems.forEach((legendItem) => {
    const legend = new Legend({
      title: legendItem.title,
      margin: 5,
    });
    const legendCtrl = new ControlLegend({
      legend,
      collapsed: false,
    });
    map.addControl(legendCtrl);
    legendItem.elements.forEach((elem) => {
      legend.addItem({
        title: elem.text,
        typeGeom: 'Polygon',
        style: makeStyle(elem.symbolizer),
      });
    });
  });
};

export default makeLegend;
