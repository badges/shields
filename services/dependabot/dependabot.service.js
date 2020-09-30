'use strict'

const url = require('url')
const Joi = require('joi')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  status: Joi.string().required(),
  colour: Joi.string().required(),
})

module.exports = class DependabotSemverCompatibility extends BaseJsonService {
  static category = 'analysis'
  static route = {
    base: 'dependabot/semver',
    pattern: ':packageManager/:dependencyName',
  }

  static examples = [
    {
      title: 'Dependabot SemVer Compatibility',
      namedParams: { packageManager: 'bundler', dependencyName: 'puma' },
      staticPreview: {
        color: 'green',
        message: '98%',
      },
    },
  ]

  static defaultBadgeData = { label: 'semver stability' }

  _getQuery({ packageManager, dependencyName }) {
    return {
      'package-manager': packageManager,
      'dependency-name': dependencyName,
      'version-scheme': 'semver',
    }
  }

  async fetch({ packageManager, dependencyName }) {
    const url = `https://api.dependabot.com/badges/compatibility_score`
    return this._requestJson({
      schema,
      url,
      options: { qs: this._getQuery({ packageManager, dependencyName }) },
    })
  }

  _getLink({ packageManager, dependencyName }) {
    const qs = new url.URLSearchParams(
      this._getQuery({ packageManager, dependencyName })
    )
    return `https://dependabot.com/compatibility-score.html?${qs.toString()}`
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
