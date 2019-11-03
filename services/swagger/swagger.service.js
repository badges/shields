'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

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
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'swagger/valid/2.0',
      pattern: ':scheme(http|https)?/:fileExtension(json|yaml)?/:url*',
    }
  }

  static get examples() {
    return [
      {
        title: 'Swagger Validator',
        pattern: ':scheme/:fileExtension/:url',
        staticPreview: this.render({ message: 'valid', clr: 'brightgreen' }),
        namedParams: {
          scheme: 'https',
          fileExtension: 'json',
          url:
            'raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/petstore-expanded',
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

  async fetch({ scheme, fileExtension, urlF }) {
    const url = 'http://validator.swagger.io/validator/debug'
    return this._requestJson({
      url,
      schema: validatorSchema,
      options: {
        qs: {
          url: `${scheme}://${urlF}.${fileExtension}`,
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
    } else {
      return 'invalid'
    }
  }

  async handle({ scheme, fileExtension, url }) {
    const json = await this.fetch({ scheme, fileExtension, urlF: url })
    const valMessages = json.schemaValidationMessages

    return this.constructor.render({ message: this.transform(valMessages) })
  }
}
