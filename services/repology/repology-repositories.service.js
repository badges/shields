'use strict'

const Joi = require('@hapi/joi')
const { BaseSvgScrapingService } = require('..')

const schema = Joi.object({
  message: Joi.number(),
}).required()

module.exports = class RepologyRepositories extends BaseSvgScrapingService {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: 'repology/repositories',
      pattern: ':projectName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Repology',
        namedParams: { projectName: 'starship' },
        staticPreview: this.render({ repositoryCount: '18' }),
        keywords: ['repositories'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'in repositories' }
  }

  static render({ repositoryCount }) {
    return {
      message: repositoryCount,
      color: 'blue',
    }
  }

  async handle({ projectName }) {
    const { message: repositoryCount } = await this._requestSvg({
      schema,
      url: `https://repology.org/badge/tiny-repos/${projectName}.svg`,
    })

    return this.constructor.render({ repositoryCount })
  }
}
