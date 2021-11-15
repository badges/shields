import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { BaseJsonService, NotFound } from '../index.js'

const schema = Joi.object()
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
  specUrl: optionalUrl.required(),
}).required()

export default class SwaggerValidatorService extends BaseJsonService {
  static category = 'other'

  static route = {
    base: 'swagger/valid',
    pattern: '3.0',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Swagger Validator',
      staticPreview: this.render({ status: 'valid' }),
      namedParams: {},
      queryParams: {
        specUrl:
          'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/petstore-expanded.json',
      },
    },
  ]

  static defaultBadgeData = {
    label: 'swagger',
  }

  static render({ status }) {
    if (status === 'valid') {
      return { message: status, color: 'brightgreen' }
    } else {
      return { message: status, color: 'red' }
    }
  }

  async fetch({ specUrl }) {
    return this._requestJson({
      url: 'http://validator.swagger.io/validator/debug',
      schema,
      options: {
        searchParams: {
          url: specUrl,
        },
      },
    })
  }

  transform({ json, specUrl }) {
    const valMessages = json.schemaValidationMessages
    if (!valMessages || valMessages.length === 0) {
      return { status: 'valid' }
    } else if (valMessages.length === 1) {
      const { message, level } = valMessages[0]
      if (level === 'error' && message === `Can't read from file ${specUrl}`) {
        throw new NotFound({ prettyMessage: 'spec not found or unreadable ' })
      }
    }
    if (valMessages.every(msg => msg.level === 'warning')) {
      return { status: 'valid' }
    }
    return { status: 'invalid' }
  }

  async handle(_routeParams, { specUrl }) {
    const json = await this.fetch({ specUrl })
    const { status } = this.transform({ json, specUrl })
    return this.constructor.render({ status })
  }
}
