'use strict'
/**
 * @module badge-maker
 */

const _makeBadge = require('./make-badge')

class ValidationError extends Error {}

function _validate(format) {
  if (format !== Object(format)) {
    throw new ValidationError('makeBadge takes an argument of type object')
  }

  if (!('message' in format)) {
    throw new ValidationError('Field `message` is required')
  }

  const stringFields = ['labelColor', 'color', 'message', 'label', 'logoBase64']
  stringFields.forEach(function (field) {
    if (field in format && typeof format[field] !== 'string') {
      throw new ValidationError(`Field \`${field}\` must be of type string`)
    }
  })

  const numberFields = ['logoWidth']
  numberFields.forEach(function (field) {
    if (field in format && typeof format[field] !== 'number') {
      throw new ValidationError(`Field \`${field}\` must be of type number`)
    }
  })

  if ('links' in format) {
    if (!Array.isArray(format.links)) {
      throw new ValidationError('Field `links` must be an array of strings')
    } else {
      format.links.forEach(function (field) {
        if (typeof field !== 'string') {
          throw new ValidationError('Field `links` must be an array of strings')
        }
      })
    }
  }

  const styleValues = [
    'plastic',
    'flat',
    'flat-square',
    'for-the-badge',
    'social',
  ]
  if ('style' in format && !styleValues.includes(format.style)) {
    throw new ValidationError(
      `Field \`style\` must be one of (${styleValues.toString()})`,
    )
  }
}

function _clean(format) {
  const expectedKeys = [
    'label',
    'message',
    'labelColor',
    'color',
    'style',
    'logoBase64',
    'logoWidth',
    'links',
  ]

  const cleaned = {}
  Object.keys(format).forEach(key => {
    if (format[key] != null && expectedKeys.includes(key)) {
      cleaned[key] = format[key]
    } else {
      throw new ValidationError(
        `Unexpected field '${key}'. Allowed values are (${expectedKeys.toString()})`,
      )
    }
  })

  // Legacy.
  cleaned.label = cleaned.label || ''

  return cleaned
}

/**
 * Create a badge
 *
 * @param {object} format Object specifying badge data
 * @param {string} format.label (Optional) Badge label (e.g: 'build')
 * @param {string} format.message (Required) Badge message (e.g: 'passing')
 * @param {string} format.labelColor (Optional) Label color
 * @param {string} format.color (Optional) Message color
 * @param {string} format.style (Optional) Visual style (e.g: 'flat')
 * @param {string} format.logoBase64 (Optional) Logo data URL
 * @param {number} format.logoWidth (Optional) Logo width (e.g: 40). This property is deprecated. Do not use it.
 * @param {Array} format.links (Optional) Links array (e.g: ['https://example.com', 'https://example.com'])
 * @returns {string} Badge in SVG format
 * @see https://github.com/badges/shields/tree/master/badge-maker/README.md
 */
function makeBadge(format) {
  _validate(format)
  const cleanedFormat = _clean(format)
  return _makeBadge(cleanedFormat)
}

module.exports = {
  makeBadge,
  ValidationError,
}
