'use strict'

const BaseJsonService = require('../base-json')
const Joi = require('joi')

const schema = Joi.object({
  status: Joi.string().required(),
  colour: Joi.string().required(),
})

module.exports = class DependabotSemverCompatibility extends BaseJsonService {
  async fetch({ packageManager, dependencyName }) {
    const url = `https://api.dependabot.com/badges/compatibility_score?package-manager=${packageManager}&dependency-name=${dependencyName}&version-scheme=semver`
    return this._requestJson({ schema, url })
  }

  static get defaultBadgeData() {
    return { label: 'semver stability' }
  }

  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'dependabot/semver',
      pattern: ':packageManager/:dependencyName',
    }
  }

  static _getLink({ packageManager, dependencyName }) {
    return `https://dependabot.com/compatibility-score.html?package-manager=${packageManager}&dependency-name=${dependencyName}&version-scheme=semver`
  }

  static get examples() {
    return [
      {
        title: 'Dependabot SemVer Compatibility',
        namedParams: { packageManager: 'bundler', dependencyName: 'puma' },
        staticExample: {
          color: 'green',
          message: '98%',
        },
      },
    ]
  }

  async handle({ packageManager, dependencyName }) {
    const json = await this.fetch({ packageManager, dependencyName })
    return {
      color: json.colour,
      message: json.status,
      link: this.constructor._getLink({ packageManager, dependencyName }),
    }
  }
}
