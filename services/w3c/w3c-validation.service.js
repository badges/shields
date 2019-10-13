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
const { NotFound } = require('..')

const schema = Joi.object({
  messages: Joi.array()
    .required()
    .items(
      Joi.object({
        type: Joi.string()
          .allow('info', 'error', 'non-document-error')
          .required(),
        message: Joi.string().required(),
      })
    ),
}).required()

const queryParamSchema = Joi.object({
  targetUrl: optionalUrl.required(),
  preset: Joi.string()
    .regex(presetRegex)
    .allow(''),
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
          targetUrl: 'https://validator.w3.org/nu/',
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
      message: getMessage(messageTypes),
      color: getColor(messageTypes),
    }
  }

  async fetch(targetUrl, preset, parser) {
    return this._requestJson({
      url: 'https://validator.w3.org/nu/',
      schema,
      options: {
        qs: {
          schema: getSchema(preset),
          parser: parser === 'default' ? undefined : parser,
          doc: encodeURI(targetUrl),
          out: 'json',
        },
      },
    })
  }

  transform(messages) {
    return messages.reduce((accumulator, item) => {
      const { type, message } = item
      let mappedType = type
      if (
        mappedType === 'non-document-error' &&
        message ===
          'HTTP resource not retrievable. The HTTP status from the remote server was: 404.'
      ) {
        throw new NotFound({ prettyMessage: 'target url not found' })
      }

      if (mappedType === 'info') {
        mappedType = 'warning'
      } else {
        // All messages are suppose to have a type and there can only be info, error or non-document
        // If a new type gets introduce this will flag them as errors
        mappedType = 'error'
      }

      if (!(mappedType in accumulator)) {
        accumulator[mappedType] = 0
      }
      accumulator[mappedType] += 1
      return accumulator
    }, {})
  }

  async handle({ parser }, { targetUrl, preset }) {
    const { messages } = await this.fetch(targetUrl, preset, parser)
    return this.constructor.render({
      messageTypes: this.transform(messages),
    })
  }
}
