'use strict'

const { coveragePercentage } = require('../color-formatters')
const {
  BaseLocalizelyService,
  keywords,
  documentation,
  queryParamSchema,
} = require('./localizely-base')

module.exports = class LocalizelyProgress extends BaseLocalizelyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'localizely/progress',
      pattern: ':projectId/:branch*',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
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
    ]
  }

  static render({ reviewedProgress }) {
    return {
      label: 'localized',
      message: `${reviewedProgress}%`,
      color: coveragePercentage(reviewedProgress),
    }
  }

  async handle({ projectId, branch }, { token: apiToken }) {
    const json = await this.fetch({ projectId, branch, apiToken })

    const { reviewedProgress } = json

    return this.constructor.render({ reviewedProgress })
  }
}
