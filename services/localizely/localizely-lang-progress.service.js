'use strict'

const { InvalidResponse } = require('..')
const { coveragePercentage } = require('../color-formatters')
const {
  BaseLocalizelyService,
  keywords,
  documentation,
  queryParamSchema,
} = require('./localizely-base')

module.exports = class Localizely extends BaseLocalizelyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'localizely',
      pattern: 'lang-progress/:projectId/:languageCode/:branch*',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Localizely language progress',
        keywords,
        documentation,
        namedParams: {
          projectId: '1349592f-8d05-4317-9f46-bddc5def11fe',
          languageCode: 'en-US',
          branch: 'main',
        },
        queryParams: {
          token:
            '312045388bfb4d2591cfe1d60868ea52b63ac6daa6dc406b9bab682f4d9ab715',
        },
        staticPreview: this.render({
          langName: 'English (US)',
          reviewedProgress: 97,
        }),
      },
    ]
  }

  static render({ langName, reviewedProgress }) {
    return {
      label: langName,
      message: `${reviewedProgress}%`,
      color: coveragePercentage(reviewedProgress),
    }
  }

  async handle({ projectId, languageCode, branch }, { token: apiToken }) {
    const json = await this.fetch({ projectId, branch, apiToken })

    const language = json.languages.find(lang => lang.langCode === languageCode)
    if (!language) {
      throw new InvalidResponse({ prettyMessage: 'Unsupported language' })
    }

    const { langName, reviewedProgress } = language

    return this.constructor.render({ langName, reviewedProgress })
  }
}
