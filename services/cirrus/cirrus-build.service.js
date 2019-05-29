'use strict'

const Joi = require('joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { BaseSvgScrapingService } = require('..')

const schema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
    .required(),
}).required()

module.exports = class CirrusBuild extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  String route(String reponame) {
    return 'https://api.cirrus-ci.com'
  }

  static get examples() {
    const { staticPreview } = this
    return [
      {
        title: 'Cirrus CI - Base Branch Build Status',
        pattern: '/github/:user/:repo',
        namedParams: { user: 'flutter', repo: 'flutter' },
        staticPreview
      },
      {
        title: 'Cirrus CI - Specific Branch Build Status',
        pattern: '/github/:user/:repo/?branch=:branch',
        namedParams: { user: 'flutter', repo: 'flutter', branch: 'master' },
        staticPreview
      },
      {
        title: 'Cirrus CI - Specific Task Build Status',
        pattern: '/github/:user/:repo?task=:task',
        namedParams: { user: 'flutter', repo: 'flutter', task: 'analyze' },
        staticPreview
      },
      {
        title: 'Cirrus CI - Task and Script Build Status',
        pattern: '/github/:user/:repo?task=:task&script=:script',
        namedParams: { user: 'flutter', repo: 'flutter', task: 'analyze', script: 'test' },
        staticPreview
      }
    ]
  }

  static get staticPreview() {
    return { message: 'passing', color: 'brightgreen' }
  }

  static get defaultBadgeData() {
    return {
      label: 'Cirrus CI Build',
    }
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async handle({ userRepo, branch }) {
    const { message: status } = await this._requestSvg({
      schema,
      url: `https://api.cirrus-ci.com/${userRepo}.json`,
      options: { qs: { branch } },
      valueMatcher: />([^<>]+)<\/text><\/g>/,
    })

    return this.constructor.render({ status })
  }
}
