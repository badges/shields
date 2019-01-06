'use strict'

const Joi = require('joi')

const BaseSvgScrapingService = require('../base-svg-scraping')

const schema = Joi.object({
  message: Joi.string()
    .regex(/^[a-z]+$/)
    .required(),
}).required()

module.exports = class TravisBuild extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'travis',
      format: '(?:(com)/)?(?!php-v)([^/]+/[^/]+)(?:/(.+))?',
      capture: ['comDomain', 'userRepo', 'branch'],
    }
  }

  static get examples() {
    const { staticExample } = this
    return [
      {
        title: 'Travis (.org)',
        pattern: ':user/:repo',
        namedParams: { user: 'rust-lang', repo: 'rust' },
        staticExample,
      },
      {
        title: 'Travis (.org) branch',
        pattern: ':user/:repo/:branch',
        namedParams: { user: 'rust-lang', repo: 'rust', branch: 'master' },
        staticExample,
      },
      {
        title: 'Travis (.com)',
        pattern: 'com/:user/:repo',
        namedParams: { user: 'ivandelabeldad', repo: 'rackian-gateway' },
        staticExample,
      },
      {
        title: 'Travis (.com) branch',
        pattern: 'com/:user/:repo/:branch',
        namedParams: {
          user: 'ivandelabeldad',
          repo: 'rackian-gateway',
          branch: 'master',
        },
        staticExample,
      },
    ]
  }

  static get staticExample() {
    return { message: 'passing', color: 'brightgreen' }
  }

  static get defaultBadgeData() {
    return {
      label: 'build',
    }
  }

  static render({ state }) {
    let color
    if (state === 'passing') {
      color = 'brightgreen'
    } else if (state === 'failing' || state === 'error') {
      color = 'red'
    }
    return {
      message: state,
      color: color,
    }
  }

  async handle({ comDomain, userRepo, branch }) {
    const domain = comDomain || 'org'
    const { message: state } = await this._requestSvg({
      schema,
      url: `https://api.travis-ci.${domain}/${userRepo}.svg`,
      options: { qs: { branch } },
      valueMatcher: />([^<>]+)<\/text><\/g>/,
    })

    return this.constructor.render({ state })
  }
}
