'use strict'

const BaseJsonService = require('../base-json')
const Joi = require('joi')
const url = require('url')

const schema = Joi.object({
  status: Joi.string().required(),
  colour: Joi.string().required(),
})

module.exports = class DependabotSemverCompatibility extends BaseJsonService {
  async fetch({ packageManager, dependencyName }) {
    const url = `https://api.dependabot.com/badges/compatibility_score`
    return this._requestJson({
      schema,
      url,
      options: { qs: this._getQuery({ packageManager, dependencyName }) },
    })
  }

  static get defaultBadgeData() {
    return { label: 'semver stability' }
  }

  static get category() {
    return 'quality'
  }

  static get route() {
    return {
      base: 'dependabot/semver',
      pattern: ':packageManager/:dependencyName',
    }
  }

  _getQuery({ packageManager, dependencyName }) {
    return {
      'package-manager': packageManager,
      'dependency-name': dependencyName,
      'version-scheme': 'semver',
    }
  }

  _getLink({ packageManager, dependencyName }) {
    const qs = new url.URLSearchParams(
      this._getQuery({ packageManager, dependencyName })
    )
    return `https://dependabot.com/compatibility-score.html?${qs.toString()}`
  }

  static get examples() {
    return [
      {
        title: 'Dependabot SemVer Compatibility',
        namedParams: { packageManager: 'bundler', dependencyName: 'puma' },
        staticPreview: {
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
      link: this._getLink({ packageManager, dependencyName }),
    }
  }
}
