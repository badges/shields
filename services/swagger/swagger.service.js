'use strict'

const Joi = require('@hapi/joi')
const { optionalUrl } = require('../validators')
const { BaseJsonService, NotFound } = require('..')

const validatorSchema = Joi.object()
  .keys({
    schemaValidationMessages: Joi.array().items(
      Joi.object({
        level: Joi.string().required(),
        message: Joi.string().required(),
      }).required()
    ),
  })
  .required()

const queryParamSchema = Joi.object({
  url: optionalUrl.required(),
}).required()

module.exports = class SwaggerValidatorService extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'swagger/valid/3.0',
      pattern: 'spec',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Swagger Validator',
        staticPreview: this.render({ message: 'valid', clr: 'brightgreen' }),
        namedParams: {},
        queryParams: {
          url:
            'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/petstore-expanded.json',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'swagger' }
  }

  static render({ message }) {
    if (message === 'valid') {
      return { message, color: 'brightgreen' }
    } else {
      return { message, color: 'red' }
    }
  }

  async fetch({ urlF }) {
    const url = 'http://validator.swagger.io/validator/debug'
    return this._requestJson({
      url,
      schema: validatorSchema,
      options: {
        qs: {
          url: urlF,
        },
      },
    })
  }

  transform(valMessages) {
    if (
      !valMessages ||
      valMessages.length === 0 ||
      valMessages.every(msg => msg.level === 'warning')
    ) {
      return 'valid'
    } else if (
      valMessages.length === 1 &&
      valMessages[0].level === 'error' &&
      valMessages[0].message.includes("Can't read from file")
    ) {
      throw new NotFound({ prettyMessage: 'spec not found' })
    } else {
      return 'invalid'
    }
  }

  async handle(_routeParams, { url }) {
    const json = await this.fetch({ urlF: url })
    const valMessages = json.schemaValidationMessages

    return this.constructor.render({ message: this.transform(valMessages) })
  }
}
