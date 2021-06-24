import '../css/popup.css';
import Overlay from 'ol/Overlay';
import { extractFeatureProperties } from './helpers';

/**
 * Get the elements necessary to manipulate the popup
 * that displays information about a feature
 *
 * @param {string} map A reference to the map
 * @returns {object} An object with 4 members (container, content, closer and overlay)
 */
const getPopupElements = (() => {
  let innerElements;
  return (map) => {
    if (!innerElements) {
      const _container = document.createElement('div');
      _container.id = 'popup';
      _container.classList = ['ol-popup'];
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
      innerElements = {
        container: _container,
        content: _content,
        closer: _closer,
        overlay: _overlay,
      };
    }
    return innerElements;
  };
})();

/**
 * Display the popup that will contain the properties
 * of the given `ft` on the given `map` at the given `coords`.
 *
 * @param {}
 * @param {}
 * @param {}
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
<p class="uri-feature"><a href="${idIndividual}" target="_blank">${idIndividual}</a></p>
<table class="table-info">
  <tbody>
${propertiesToRender
    .map((d) => `<tr><td title="${d.propertyIRI}" class="field-name"><span>${d.propertyName}</td><td><span class="field-value">${d.value}</span></td></tr>`)
    .join('')}
  </tbody>
</table>`;

  // Display the popup on the map so that it will follow
  // the clicked coordinates when panning
  overlay.setPosition(coords);
};

export { displayPopup as default };
