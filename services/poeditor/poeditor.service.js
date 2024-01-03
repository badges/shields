import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { coveragePercentage } from '../color-formatters.js'
import {
  BaseJsonService,
  InvalidResponse,
  pathParam,
  queryParam,
} from '../index.js'

const description = `
POEditor is an web-based tool for translation and internationalization

All requests to must contain the parameter \`token\`.
You can get a read-only token from your POEditor account in [My Account > API Access](https://poeditor.com/account/api).
This token will be exposed as part of the badge URL so be sure to generate a read-only token.
`

const schema = Joi.object({
  response: Joi.object({
    code: nonNegativeInteger,
    message: Joi.string().required(),
  }).required(),
  result: Joi.object({
    languages: Joi.array()
      .items({
        name: Joi.string().required(),
        code: Joi.string().required(),
        percentage: Joi.number().min(0).max(100).required(),
      })
      .required(),
  }),
}).required()

const queryParamSchema = Joi.object({
  token: Joi.string().required(),
}).required()

export default class POEditor extends BaseJsonService {
  static category = 'other'

  static route = {
    base: 'poeditor',
    pattern: 'progress/:projectId/:languageCode',
    queryParamSchema,
  }

  static openApi = {
    '/poeditor/progress/{projectId}/{languageCode}': {
      get: {
        summary: 'POEditor',
        description,
        parameters: [
          pathParam({ name: 'projectId', example: '323337' }),
          pathParam({ name: 'languageCode', example: 'fr' }),
          queryParam({
            name: 'token',
            example: 'abc123def456',
            description:
              'A read-only token from your POEditor account from [My Account > API Access](https://poeditor.com/account/api)',
            required: true,
          }),
        ],
      },
    },
  }

  static render({ code, message, language }) {
    if (code !== 200) {
      throw new InvalidResponse({ prettyMessage: message })
    }

    if (language === undefined) {
      throw new InvalidResponse({ prettyMessage: 'Language not in project' })
    }

    return {
      label: language.name,
      message: `${language.percentage.toFixed(0)}%`,
      color: coveragePercentage(language.percentage),
    }
  }

  async fetch({ projectId, token }) {
    return this._requestJson({
      schema,
      url: 'https://api.poeditor.com/v2/languages/list',
      options: {
        method: 'POST',
        form: {
          api_token: token,
          id: projectId,
        },
      },
    })
  }

  async handle({ projectId, languageCode }, { token }) {
    const {
      response: { code, message },
      result: { languages } = { languages: [] },
    } = await this.fetch({ projectId, token })
    return this.constructor.render({
      code,
      message,
      language: languages.find(lang => lang.code === languageCode),
    })
  }
}
