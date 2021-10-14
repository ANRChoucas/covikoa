import '../css/legend.css';
import Legend from 'ol-ext/legend/Legend';
import ControlLegend from 'ol-ext/control/Legend';
import { makeStyle } from './utils/ol-style';
import { getValue } from './helpers';

/**
* Construct the legend for a given 'map', according to the 'portrayals'
* it contains.
* We use ol-ext.legend.Legend and ol-ext.control.Legend for this.
*
* @param {ol/Map} map - The map on which the legend will be added.
* @param {array} res_list - The result of the sparql query for this map.
* @param {array} portrayals - ..
* @returns {void}
*/
const makeLegend = (map, res_list, portrayals) => {
  // Extract the information to build the legend...
  const tempSymb = {};
  res_list.forEach((r) => {
    // We dont build legend for TextSymbolizer for now
    if (getValue(r, 'typeSymbolizer', '') === 'https://gis.lu.se/ont/data_portrayal/symbolizer#TextSymbolizer') return;

    const iriPortrayal = getValue(r, 'portrayal', null);
    // If legend is requested but no title is provided for the portrayal we use its IRI
    const labelPortrayal = getValue(r, 'labelPortrayal', null) || iriPortrayal; // eslint-disable-line no-plusplus

    const iriSymbolizer = getValue(r, 'symbolizer', null);
    // If legend is requested but no title/label is provided for the symbolizer we use its IRI
    const labelSymbol = getValue(r, 'labelSymbol', null) || iriSymbolizer;

    // Collect description of symbolizer inside their portrayal
    if (tempSymb[labelPortrayal] !== undefined) {
      tempSymb[labelPortrayal].add(
        JSON.stringify([labelSymbol, iriSymbolizer]),
      );
    } else {
      tempSymb[labelPortrayal] = new Set(
        [JSON.stringify([labelSymbol, iriSymbolizer])],
      );
    }
  });

  const candidateSymbolizers = portrayals
    .flatMap((el) => (el.symbolizer ? el.symbolizer : el.symbolizers));

  const legendItems = [];
  Object.keys(tempSymb).forEach((titleGroup) => {
    const resGroup = { title: titleGroup, elements: [] };
    [...tempSymb[titleGroup]].forEach((el) => {
      const [value, symbolizer] = JSON.parse(el);
      const o = candidateSymbolizers.find((d) => d.name === symbolizer);
      resGroup.elements.push({ symbolizer: o, text: value });
    });
    legendItems.push(resGroup);
  });

  legendItems.forEach((group) => {
    if (JSON.parse(group.elements[0].symbolizer.specJSON).kind === 'Mark') {
      // eslint-disable-next-line no-param-reassign
      const t = group.elements
        .sort((a, b) => JSON.parse(b.symbolizer.specJSON).radius
          - JSON.parse(a.symbolizer.specJSON).radius);
      group.elements = [t[0], t[3], t[t.length - 1]];
    }
  });

  // Collapse the legend if there is numerous items
  const collapsed = legendItems.some((el) => el.elements.length > 6);

  // Build the legend
  // with the help of ol-ext/legend/Legend and ol-ext/control/Legend components
  let firstLegendCtrl;

  legendItems.forEach((legendItem, j) => {
    const legend = new Legend({
      title: legendItem.title,
      margin: 5,
    });
    // If there is multiple groups of legend element for a map
    // we need to specify that the following groups have
    // to be attached to the first one by specifying a 'target' argument
    if (j === 0) {
      // get reference to first group if needed by the following ones..
      firstLegendCtrl = new ControlLegend({
        legend,
        collapsed,
      });
      map.addControl(firstLegendCtrl);
    } else {
      // target the first ControlLegend
      map.addControl(new ControlLegend({
        legend,
        collapsed,
        target: firstLegendCtrl.element,
      }));
    }
    legendItem.elements.forEach((elem) => {
      const typeGeom = elem.symbolizer.type.replace('Symbolizer', '');
      legend.addItem({
        style: makeStyle(elem.symbolizer),
        title: elem.text,
        typeGeom,
      });
    });
  });
};

export default makeLegend;
