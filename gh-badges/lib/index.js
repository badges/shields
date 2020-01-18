'use strict'
/**
 * @module gh-badges
 */

const _makeBadge = require('./make-badge')
const svg2img = require('./svg-to-img')
let gm
try {
  gm = require('gm')
} catch (e) {
  gm = null
}

class ValidationError extends Error {}

function _validate(format) {
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

  if (
    !gm &&
    'format' in format &&
    ['png', 'jpg', 'gif'].includes(format.format)
  ) {
    throw new ValidationError(
      `peerDependency gm is required for output in .${format.format} format`
    )
  }

  const formatValues = ['svg', 'json', 'png', 'jpg', 'gif']
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
    'social',
  ]
  if ('template' in format && !templateValues.includes(format.template)) {
    throw new ValidationError(
      `Field \`template\` must be one of (${templateValues.toString()})`
    )
  }
}

function _clean(format) {
  const expectedKeys = ['text', 'labelColor', 'color', 'format', 'template']
  const cleaned = {}
  Object.keys(format).forEach(key => {
    if (format[key] != null && expectedKeys.includes(key)) {
      cleaned[key] = format[key]
    }
  })
  return cleaned
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
 * @returns {string} Badge in SVG or JSON format
 * @see https://github.com/badges/shields/tree/master/gh-badges/README.md
 */
async function makeBadge(format) {
  const cleanedFormat = _clean(format)
  _validate(cleanedFormat)
  if (/png|jpg|gif/.test(format.format)) {
    return await svg2img(_makeBadge(cleanedFormat), format.format)
  } else {
    return _makeBadge(cleanedFormat)
  }
}

module.exports = {
  makeBadge,
  ValidationError,
}
