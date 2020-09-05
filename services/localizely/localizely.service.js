'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService, InvalidResponse } = require('..')
const { coveragePercentage } = require('../color-formatters')

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
    The read-only API token from the Localizely account is required to fetch necessary data.
    <br/>
    You can find more details regarding API tokens under <a href="https://app.localizely.com/account" target="_blank">My profile</a> page.
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

module.exports = class Localizely extends BaseJsonService {
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
        projectId: '1349592f-8d05-4317-9f46-bddc5def11fe',
        branch: 'main',
      },
      queryParams: {
        token:
          '312045388bfb4d2591cfe1d60868ea52b63ac6daa6dc406b9bab682f4d9ab715',
      },
      staticPreview: this.render({ reviewedProgress: 93 }),
    },
    {
      title: 'Localizely language progress',
      keywords,
      documentation,
      namedParams: {
        projectId: '1349592f-8d05-4317-9f46-bddc5def11fe',
        branch: 'main',
      },
      queryParams: {
        token:
          '312045388bfb4d2591cfe1d60868ea52b63ac6daa6dc406b9bab682f4d9ab715',
        languageCode: 'en-US',
      },
      staticPreview: this.render({
        langName: 'English (US)',
        reviewedProgress: 97,
      }),
    },
  ]

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
        qs: { branch },
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
