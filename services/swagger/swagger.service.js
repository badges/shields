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
    return { message: message, color: clr }
  }

  static get url() {
    return {
      base: 'swagger/valid/2.0',
      format: '(http(?:s)?)/(.+)',
      capture: ['protocol', 'url'],
    }
  }

  static get defaultBadgeData() {
    return { label: 'swagger' }
  }

  async handle({ protocol, url }) {
    const json = await this.fetch({ protocol, urlF: url })
    const valMessages = json.schemaValidationMessages

    if (!valMessages || valMessages.length === 0) {
      return this.constructor.render({ message: 'valid', clr: 'brightgreen' })
    } else {
      return this.constructor.render({ message: 'invalid', clr: 'red' })
    }
  }

  async fetch({ protocol, urlF }) {
    const url = `http://online.swagger.io/validator/debug?url=${protocol}://${urlF}`
    return this._requestJson({
      url,
      schema: validatorSchema,
    })
  }

  static get category() {
    return 'other'
  }

  static get examples() {
    return [
      {
        title: 'Swagger Validator',
        urlPattern: 'https/:url',
        staticExample: this.render({ message: 'valid', clr: 'brightgreen' }),
        exampleUrl:
          'https/raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/petstore-expanded.json',
        keywords: ['swagger'],
      },
    ]
  }
}
