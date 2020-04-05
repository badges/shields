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

  const stringFields = ['labelColor', 'color', 'message', 'label']
  stringFields.forEach(function(field) {
    if (field in format && typeof format[field] !== 'string') {
      throw new ValidationError(`Field \`${field}\` must be of type string`)
    }
  })

  const templateValues = [
    'plastic',
    'flat',
    'flat-square',
    'for-the-badge',
    'social',
  ]
  if ('template' in format && !templateValues.includes(format.template)) {
    throw new ValidationError(
      `Field \`template\` must be one of (${templateValues.toString()})`
    )
  }
}

function _clean(format) {
  const expectedKeys = ['label', 'message', 'labelColor', 'color', 'template']

  const cleaned = {}
  Object.keys(format).forEach(key => {
    if (format[key] != null && expectedKeys.includes(key)) {
      cleaned[key] = format[key]
    } else {
      throw new ValidationError(
        `Unexpected field '${key}'. Allowed values are (${expectedKeys.toString()})`
      )
    }
  })

  cleaned.text = [cleaned.label || '', cleaned.message]
  delete cleaned.label
  delete cleaned.message

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
 * @param {string} format.template (Optional) Visual template e.g: 'flat'
 * @returns {string} Badge in SVG or JSON format
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
