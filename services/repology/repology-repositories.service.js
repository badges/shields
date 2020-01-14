'use strict'

const BaseRepologyService = require('./repology-base')

module.exports = class RepologyRepositories extends BaseRepologyService {
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
    const repositories = await this.fetch({ projectName })
    return this.constructor.render({ repositoryCount: repositories.length })
  }
}
