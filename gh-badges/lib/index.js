'use strict'

const c = require('@rho-contracts/rho-contracts')
const makeBadge = require('./make-badge')
const schema = c.object({
  text: c.tuple(c.string, c.string).strict(),
  labelColor: c.optional(c.string),
  color: c.optional(c.string),
  colorA: c.optional(c.string),
  colorscheme: c.optional(c.string),
  colorB: c.optional(c.string),
  format: c.optional(c.oneOf('svg', 'json')),
  template: c.optional(
    c.oneOf(
      'plastic',
      'flat',
      'flat-square',
      'for-the-badge',
      'popout',
      'popout-square',
      'social'
    )
  ),
})

class ValidationError extends Error {}

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
    try {
      schema.check(format)
    } catch (e) {
      if (e instanceof c.ContractError) {
        const wrappedError = new ValidationError()
        Object.assign(wrappedError, e)
        wrappedError.name = 'ValidationError'
        throw wrappedError
      }
      throw e
    }

    return makeBadge(format)
  }
}

module.exports = {
  BadgeFactory,
  ValidationError,
}
