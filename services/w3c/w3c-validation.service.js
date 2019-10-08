'use strict'
const Joi = require('@hapi/joi')
const { optionalUrl } = require('../validators')
const {
  documentation,
  presetRegex,
  getColor,
  getMessage,
  getSchema,
} = require('./w3c-validation-helper')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  messages: Joi.array()
    .required()
    .items(Joi.object()),
}).required()

const presetDecode = regExpression => (preset, helpers) => {
  if (!preset) {
    return ''
  }

  if (regExpression && !regExpression.test(decodeURI(preset))) {
    return helpers.error('regex')
  }

  // Return the value unchanged
  return preset
}

const queryParamSchema = Joi.object({
  targetUrl: optionalUrl.required(),
  preset: Joi.string()
    .allow('')
    .custom(presetDecode(presetRegex), 'preset validation'),
}).required()

module.exports = class W3cValidation extends BaseJsonService {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'w3c-validation',
      pattern: ':parser(default|html|xml|xmldtd)',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'W3C Validation',
        namedParams: { parser: 'html' },
        queryParams: {
          targetUrl: 'https://about.validator.nu',
          preset: 'HTML, SVG 1.1, MathML 3.0',
        },
        staticPreview: this.render({ messageTypes: {} }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'w3c',
    }
  }

  static render({ messageTypes }) {
    return {
      label: 'w3c',
      message: getMessage(messageTypes),
      color: getColor(messageTypes),
    }
  }

  async fetch(targetUrl, preset, parser) {
    const qs = { doc: targetUrl, out: 'json' }
    if (preset) qs['schema'] = getSchema(preset)
    if (parser && parser.toLowerCase() != 'default') qs['parser'] = parser
    return this._requestJson({
      url: 'http://validator.nu',
      schema,
      options: {
        qs,
      },
    })
  }

  async handle({ parser }, { targetUrl, preset }) {
    const data = await this.fetch(targetUrl, preset, parser)
    const reducer = (accumulator, message) => {
      let { type } = message
      if (type === 'info') {
        type = 'warning'
      } else {
        // All messages are suppose to have a type and there can only be info, error or non-document
        // If a new type gets introduce this will flag them as errors
        type = 'error'
      }

      if (!(type in accumulator)) {
        accumulator[type] = 0
      }
      accumulator[type] += 1
      return accumulator
    }
    const messageTypes = data.messages.reduce(reducer, {})
    const badge = this.constructor.render({
      messageTypes,
    })
    return badge
  }
}
