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
   * @param {string} format.colorscheme
   * @param {string} format.colorA
   * @param {string} format.colorB
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
