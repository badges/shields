'use strict'

const makeBadge = require('./make-badge')

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
   * @param {object} format - Object specifying badge data
   * @param {string[]} format.text
   * @param {string} format.labelColor - label color
   * @param {string} format.color - message color
   * @param {string} format.colorA - deprecated: alias for `labelColor`
   * @param {string} format.colorscheme - deprecated: alias for `color`
   * @param {string} format.colorB - deprecated: alias for `color`
   * @param {string} format.format
   * @param {string} format.template
   * @return {string} Badge in SVG or JSON format
   * @see https://github.com/badges/shields/tree/master/gh-badges/README.md
   */
  create(format) {
    return makeBadge(format)
  }
}

module.exports = {
  BadgeFactory,
}
