import Joi from 'joi'
import { BaseJsonService, InvalidResponse } from '../index.js'
import { coveragePercentage } from '../color-formatters.js'

const keywords = [
  'l10n',
  'i18n',
  'localization',
  'internationalization',
  'translation',
  'translations',
]

const documentation = `
  <p>
    The <b>read-only</b> API token from the Localizely account is required to fetch necessary data.
    <br/>
    <br/>
    <b>
      Note: Do not use the default API token as it grants full read-write permissions to your projects. You will expose your project and allow malicious users to modify the translations at will.
      <br/>
      Instead, create a new one with only read permission.
    </b>
    <br/>
    <br/>
    You can find more details regarding API tokens under <a href="https://app.localizely.com/account" target="_blank">My profile</a> page.
    <br/>
  </p>
  `

const schema = Joi.object({
  strings: Joi.number().required(),
  reviewedProgress: Joi.number().required(),
  languages: Joi.array()
    .items(
      Joi.object({
        langCode: Joi.string().required(),
        langName: Joi.string().required(),
        strings: Joi.number().required(),
        reviewed: Joi.number().required(),
        reviewedProgress: Joi.number().required(),
      })
    )
    .required(),
}).required()

const queryParamSchema = Joi.object({
  token: Joi.string().required(),
  languageCode: Joi.string().regex(/^[a-z]{2}(-[A-Z][a-z]{3})?(-[A-Z]{2})?$/),
}).required()

export default class Localizely extends BaseJsonService {
  static category = 'other'

  static route = {
    base: 'localizely/progress',
    pattern: ':projectId/:branch*',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Localizely overall progress',
      keywords,
      documentation,
      namedParams: {
        projectId: '5cc34208-0418-40b1-8353-acc70c95f802',
        branch: 'main',
      },
      queryParams: {
        token:
          '0f4d5e31a44f48dcbab966c52cfb0a67c5f1982186c14b85ab389a031dbc225a',
      },
      staticPreview: this.render({ reviewedProgress: 93 }),
    },
    {
      title: 'Localizely language progress',
      keywords,
      documentation,
      namedParams: {
        projectId: '5cc34208-0418-40b1-8353-acc70c95f802',
        branch: 'main',
      },
      queryParams: {
        token:
          '0f4d5e31a44f48dcbab966c52cfb0a67c5f1982186c14b85ab389a031dbc225a',
        languageCode: 'en-US',
      },
      staticPreview: this.render({
        langName: 'English (US)',
        reviewedProgress: 97,
      }),
    },
  ]

  static defaultBadgeData = { label: 'localized' }

  static render({ langName, reviewedProgress }) {
    return {
      label: langName || 'localized',
      message: `${reviewedProgress}%`,
      color: coveragePercentage(reviewedProgress),
    }
  }

  async fetch({ projectId, branch, apiToken }) {
    return this._requestJson({
      schema,
      url: `https://api.localizely.com/v1/projects/${projectId}/status`,
      options: {
        searchParams: { branch },
        headers: { 'X-Api-Token': apiToken },
      },
      errorMessages: {
        403: 'not authorized for project',
      },
    })
  }

  static transform(json, languageCode) {
    if (!languageCode) {
      return { reviewedProgress: json.reviewedProgress }
    }

    const language = json.languages.find(lang => lang.langCode === languageCode)
    if (!language) {
      throw new InvalidResponse({ prettyMessage: 'Unsupported language' })
    }

    const { langName, reviewedProgress } = language

    return { langName, reviewedProgress }
  }

  async handle({ projectId, branch }, { token: apiToken, languageCode }) {
    const json = await this.fetch({ projectId, branch, apiToken })
    const { langName, reviewedProgress } = this.constructor.transform(
      json,
      languageCode
    )

    return this.constructor.render({ langName, reviewedProgress })
  }
}
