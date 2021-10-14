import { Entity } from '@openglobus/og';

/**
 * The idea is to extend openglobus Entity with a few methods so that we can operate
 * on them the same way we operate on openlayers Feature
 * (in some extent, mostly in interaction.js in order to test these features for equality
 * based on their materialisation ID, and in order to get the properties related to
 * interaction).
 */

/**
 *
 * @returns {String} - The IRI of the materialisation represented by this openglobus Entity
 */
Entity.prototype.getId = function _ogEntityGetId() {
  return this._materialisationId;
};

/**
 *
 * @param key - The key of the property to retrieve
 * @returns {*}
 */
Entity.prototype.get = function _ogEntityGet(key) {
  return this.properties[key];
};

export default Entity;
