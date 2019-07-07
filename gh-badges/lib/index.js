'use strict'
/**
 * @module gh-badges
 */

const makeBadge = require('./make-badge')

/**
 * BadgeFactory
 */
class BadgeFactory {
  constructor(options) {
    if (options !== undefined) {
      console.error(
        'BadgeFactory: Constructor options are deprecated and will be ignored'
      )
    }
  }

  /**
   * Create a badge
   *
   * @param {object} format Object specifying badge data
   * @param {string[]} format.text Badge text in an array e.g: ['build', 'passing']
   * @param {string} format.labelColor (Optional) Label color
   * @param {string} format.color (Optional) Message color
   * @param {string} format.colorA (Deprecated, Optional) alias for `labelColor`
   * @param {string} format.colorscheme (Deprecated, Optional) alias for `color`
   * @param {string} format.colorB (Deprecated, Optional) alias for `color`
   * @param {string} format.format (Optional) Output format: 'svg' or 'json'
   * @param {string} format.template (Optional) Visual template e.g: 'flat'
   *    see {@link https://github.com/badges/shields/tree/master/gh-badges/templates}
   * @returns {string} Badge in SVG or JSON format
   * @see https://github.com/badges/shields/tree/master/gh-badges/README.md
   */
  create(format) {
    return makeBadge(format)
  }
}

module.exports = {
  BadgeFactory,
}
