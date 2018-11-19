'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

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

module.exports = class SwaggerValidatorService extends BaseJsonService {
  static render({ message, clr }) {
    return { message, color: clr }
  }

  static get route() {
    return {
      base: 'swagger/valid/2.0',
      pattern: ':scheme(http|https)?/:url*',
    }
  }

  static get defaultBadgeData() {
    return { label: 'swagger' }
  }

  async handle({ scheme, url }) {
    const json = await this.fetch({ scheme, urlF: url })
    const valMessages = json.schemaValidationMessages

    if (!valMessages || valMessages.length === 0) {
      return this.constructor.render({ message: 'valid', clr: 'brightgreen' })
    } else {
      return this.constructor.render({ message: 'invalid', clr: 'red' })
    }
  }

  async fetch({ scheme, urlF }) {
    const url = 'http://online.swagger.io/validator/debug'
    return this._requestJson({
      url,
      schema: validatorSchema,
      options: {
        qs: {
          url: `${scheme}://${urlF}`,
        },
      },
    })
  }

  static get category() {
    return 'other'
  }

  static get examples() {
    return [
      {
        title: 'Swagger Validator',
        pattern: ':scheme/:url',
        staticExample: this.render({ message: 'valid', clr: 'brightgreen' }),
        exampleUrl:
          'https/raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/petstore-expanded.json',
      },
    ]
  }
}
