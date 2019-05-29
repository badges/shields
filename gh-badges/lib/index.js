'use strict'

const Joi = require('@hapi/joi')
const makeBadge = require('./make-badge')
const schema = Joi.object({
  text: Joi.array()
    .items(Joi.string())
    .min(2)
    .max(2)
    .required(),
  labelColor: Joi.string(),
  color: Joi.string(),
  colorA: Joi.string(),
  colorscheme: Joi.string(),
  colorB: Joi.string(),
  format: Joi.string().valid('svg', 'json'),
  template: Joi.string().valid(
    'plastic',
    'flat',
    'flat-square',
    'for-the-badge',
    'popout',
    'popout-square',
    'social'
  ),
}).required()

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
    const { error, value } = Joi.validate(format, schema, {
      allowUnknown: true,
      stripUnknown: true,
    })
    if (error) throw error
    return makeBadge(value)
  }
}

module.exports = {
  BadgeFactory,
}
