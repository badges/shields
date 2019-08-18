'use strict'
/**
 * @module gh-badges
 */

const makeBadge = require('./make-badge')

class ValidationError extends Error {}

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

  _validate(format) {
    if (!('text' in format)) {
      throw new ValidationError('Field `text` is required')
    }

    if (
      !Array.isArray(format.text) ||
      format.text.length !== 2 ||
      typeof format.text[0] !== 'string' ||
      typeof format.text[1] !== 'string'
    ) {
      throw new ValidationError('Field `text` must be an array of 2 strings')
    }

    const stringFields = ['labelColor', 'color']
    stringFields.forEach(function(field) {
      if (field in format && typeof format[field] !== 'string') {
        throw new ValidationError(`Field \`${field}\` must be of type string`)
      }
    })

    const formatValues = ['svg', 'json']
    if ('format' in format && !formatValues.includes(format.format)) {
      throw new ValidationError(
        `Field \`format\` must be one of (${formatValues.toString()})`
      )
    }

    const templateValues = [
      'plastic',
      'flat',
      'flat-square',
      'for-the-badge',
      'popout',
      'popout-square',
      'social',
    ]
    if ('template' in format && !templateValues.includes(format.template)) {
      throw new ValidationError(
        `Field \`template\` must be one of (${templateValues.toString()})`
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
   * @param {string} format.format (Optional) Output format: 'svg' or 'json'
   * @param {string} format.template (Optional) Visual template e.g: 'flat'
   *    see {@link https://github.com/badges/shields/tree/master/gh-badges/templates}
   * @returns {string} Badge in SVG or JSON format
   * @see https://github.com/badges/shields/tree/master/gh-badges/README.md
   */
  create(format) {
    this._validate(format)
    return makeBadge(format)
  }
}

module.exports = {
  BadgeFactory,
}
