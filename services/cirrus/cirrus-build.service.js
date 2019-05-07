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
    return 'https://example.com'
  }

  static get examples() {
    const { staticPreview } = this
    return [
      {
        title: 'Cirrus CI Build Status',
        pattern: ':user/:repo',
        namedParams: { user: 'flutter', repo: 'flutter' },
        staticPreview,
      },
      {
        title: 'Cirrus CI Branch Build Status',
        pattern: ':user/:repo/:branch',
        namedParams: { user: 'flutter', repo: 'flutter', branch: 'master' },
        staticPreview,
      }
    ]
  }

  static get staticPreview() {
    return { message: 'passing', color: 'brightgreen' }
  }

  static get defaultBadgeData() {
    return {
      label: 'build',
    }
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async handle({ comDomain, userRepo, branch }) {
    const { message: status } = await this._requestSvg({
      schema,
      url: `https://api.cirrus-ci.com/${userRepo}.svg`,
      options: { qs: { branch } },
      valueMatcher: />([^<>]+)<\/text><\/g>/,
    })

    return this.constructor.render({ status })
  }
}
