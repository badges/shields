'use strict'
/**
 * @module badge-maker
 */

const _makeBadge = require('./make-badge')
const { normalizeColor } = require('./color')

class ValidationError extends Error {}

function _validate(format) {
  if (format !== Object(format)) {
    throw new ValidationError('makeBadge takes an argument of type object')
  }

  if (!('message' in format)) {
    throw new ValidationError('Field `message` is required')
  }

  const requiredStringFields = ['message', 'label']
  requiredStringFields.forEach(field => {
    if (field in format && typeof format[field] !== 'string') {
      throw new ValidationError(
        `Field \`${field}\` is required and must be of type string`
      )
    }
  })

  const optionalStringFields = ['labelColor', 'color']
  optionalStringFields.forEach(field => {
    if (format[field] != null && typeof format[field] !== 'string') {
      throw new ValidationError(`Field \`${field}\` must be of type string`)
    }
  })

  const styleValues = [
    'plastic',
    'flat',
    'flat-square',
    'for-the-badge',
    'social',
  ]
  if ('style' in format && !styleValues.includes(format.style)) {
    throw new ValidationError(
      `Field \`style\` must be one of (${styleValues.toString()})`
    )
  }
}

function _clean(format) {
  const expectedKeys = ['label', 'message', 'labelColor', 'color', 'style']

  const cleaned = {}
  Object.keys(format).forEach(key => {
    if (format[key] != null) {
      if (expectedKeys.includes(key)) {
        cleaned[key] = format[key]
      } else {
        throw new ValidationError(
          `Unexpected field '${key}'. Allowed values are (${expectedKeys.toString()})`
        )
      }
    }
  })

  // Whitespace removal.
  cleaned.label = `${cleaned.label}`.trim()
  cleaned.message = `${cleaned.message}`.trim()

  cleaned.color = normalizeColor(cleaned.color)
  cleaned.labelColor = normalizeColor(cleaned.labelColor)

  cleaned.style = cleaned.style || 'flat'
  cleaned.links = ['', '']

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
 * @param {string} format.style (Optional) Visual style e.g: 'flat'
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
  _clean,
}
