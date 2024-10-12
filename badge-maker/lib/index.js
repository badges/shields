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

  if ('links' in format) {
    if (!Array.isArray(format.links)) {
      throw new ValidationError('Field `links` must be an array of strings')
    } else {
      if (format.links.length > 2) {
        throw new ValidationError(
          'Field `links` must not have more than 2 elements',
        )
      }
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
  if ('idSuffix' in format && !/^[a-zA-Z0-9\-_]*$/.test(format.idSuffix)) {
    throw new ValidationError(
      'Field `idSuffix` must contain only numbers, letters, -, and _',
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
    'links',
    'idSuffix',
  ]

  const cleaned = {}
  Object.keys(format).forEach(key => {
    if (format[key] != null && key === 'logoBase64') {
      cleaned.logo = format[key]
    } else if (format[key] != null && expectedKeys.includes(key)) {
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
 * @param {Array} format.links (Optional) Links array (e.g: ['https://example.com', 'https://example.com'])
 * @param {string} format.idSuffix (Optional) Suffix for IDs, e.g. 1, 2, and 3 for three invocations that will be used on the same page.
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
