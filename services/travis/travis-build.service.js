'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { BaseSvgScrapingService } = require('..')

const schema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
    .required(),
}).required()

module.exports = class TravisBuild extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'travis',
      format: '(?:(com)/)?(?!php-v)([^/]+/[^/]+?)(?:/(.+?))?',
      capture: ['comDomain', 'userRepo', 'branch'],
    }
  }

  static get examples() {
    const { staticPreview } = this
    return [
      {
        title: 'Travis (.org)',
        pattern: ':user/:repo',
        namedParams: { user: 'rust-lang', repo: 'rust' },
        staticPreview,
      },
      {
        title: 'Travis (.org) branch',
        pattern: ':user/:repo/:branch',
        namedParams: { user: 'rust-lang', repo: 'rust', branch: 'master' },
        staticPreview,
      },
      {
        title: 'Travis (.com)',
        pattern: 'com/:user/:repo',
        namedParams: { user: 'ivandelabeldad', repo: 'rackian-gateway' },
        staticPreview,
      },
      {
        title: 'Travis (.com) branch',
        pattern: 'com/:user/:repo/:branch',
        namedParams: {
          user: 'ivandelabeldad',
          repo: 'rackian-gateway',
          branch: 'master',
        },
        staticPreview,
      },
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
    const domain = comDomain || 'org'
    const { message: status } = await this._requestSvg({
      schema,
      url: `https://api.travis-ci.${domain}/${userRepo}.svg`,
      options: { qs: { branch } },
      valueMatcher: />([^<>]+)<\/text><\/g>/,
    })

    return this.constructor.render({ status })
  }
}
