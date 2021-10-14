import '../css/popup.css';
import Overlay from 'ol/Overlay';
import { extractFeatureProperties } from './helpers';

const getPopupElements = (() => {
  // The popup (ol.Overlay) is linked to the map so it needs to
  // be instantiated once for each map.
  // We use the ol_uid of the maps to keep track of this
  // in the innerElementsByMap object.
  const innerElementsByMap = {};

  /**
   * Get the elements necessary to manipulate the popup
   * that displays information about a feature.
   *
   * @param {ol.Map} map - A reference to the map
   * @returns {object} An object with 4 members (container, content, closer and overlay)
   */
  const fn = (map) => {
    const uid = map.ol_uid;
    const innerElements = innerElementsByMap[uid];

    if (!innerElements) { // Popup for this map wasn't created yet
      // Code for popup creation is
      // inspired from https://openlayers.org/en/latest/examples/popup.html
      const _container = document.createElement('div');
      _container.id = 'popup';
      _container.classList.add('ol-popup');
      _container.innerHTML = `
    <a href="#" id="popup-closer" class="ol-popup-closer"></a>
    <div id="popup-content"></div>
      `;
      document.body.appendChild(_container);

      const _content = _container.querySelector('#popup-content');
      const _closer = _container.querySelector('#popup-closer');

      const _overlay = new Overlay({
        element: _container,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
      });
      map.addOverlay(_overlay);

      _closer.onclick = () => {
        _overlay.setPosition(undefined);
        _closer.blur();
        return false;
      };
      innerElementsByMap[uid] = {
        container: _container,
        content: _content,
        closer: _closer,
        overlay: _overlay,
      };
      return innerElementsByMap[uid];
    }
    return innerElements;
  };
  return fn;
})();

/**
 * Display the popup that will contain the properties
 * of the given `ft` on the given `map` at the given `coords`.
 *
 * @param {ol.Map} map - The map on which the popup have to be displayed
 * @param {ol.Feature} ft - The clicked feature
 * @param {array} coords - Coordinates of the click
 * @returns {void}
 */
const displayPopup = (map, ft, coords) => {
  // Format the values to be displayed
  const propertiesToRender = extractFeatureProperties(ft);

  // Get a reference to the popup element
  const { content, overlay } = getPopupElements(map);

  const idIndividual = ft.get('_idTargetIndividual');
  // Create the table of property-value pairs
  // with the full IRI of the property displayable when hovering over
  // its short name...
  content.innerHTML = `
<p class="uri-feature"><a href="${idIndividual}" rel="noreferrer" target="_blank">${idIndividual}</a></p>
<table class="table-info">
  <tbody>
${propertiesToRender
    .map((d) => `<tr>
      <td title="${d.propertyIRI}" class="field-name">
        <span><a href="${d.propertyIRI}" rel="noreferrer" target="_blank">${d.propertyName}</a></span>
      </td>
      <td>
        <span class="field-value">
        ${d.values.map((value, i) => `${d.valuesIRIs[i] ? `<a class="field-value" title="${d.valuesIRIs[i]}" href="${d.valuesIRIs[i]}" rel="noreferrer" target="_blank">` : ''}${value}${d.valuesIRIs[i] ? '</a>' : ''}`).join(', ')}
        </span>
      </td>
    </tr>`)
    .join('')}
  </tbody>
</table>`;

  // Display the popup on the map so that it will follow
  // the clicked coordinates when panning
  overlay.setPosition(coords);
};

export { displayPopup as default };
