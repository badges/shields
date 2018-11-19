'use strict'

const Joi = require('joi')

const BaseJsonService = require('../base-json')
const { NotFound } = require('../errors')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')
const { metric } = require('../../lib/text-formatters')
const { nonNegativeInteger } = require('../validators')

const schemaInstallations = Joi.object()
  .keys({
    installations: Joi.object()
      .required()
      .pattern(nonNegativeInteger, nonNegativeInteger)
      .min(1),
  })
  .required()

const schemaInstallationsPerVersion = Joi.object()
  .keys({
    installationsPerVersion: Joi.object()
      .required()
      .pattern(Joi.string(), nonNegativeInteger)
      .min(1),
  })
  .required()

class JenkinsPluginInstalls extends BaseJsonService {
  async fetch({ plugin, version }) {
    const url = `https://stats.jenkins.io/plugin-installation-trend/${plugin}.stats.json`
    const schema = this.constructor._getSchema(version)
    return this._requestJson({
      url,
      schema,
      errorMessages: {
        404: 'plugin not found',
      },
    })
  }

  static render({ label, installs }) {
    return {
      label,
      message: metric(installs),
      color: downloadCountColor(installs),
    }
  }

  static _getSchema(version) {
    if (version) {
      return schemaInstallationsPerVersion
    } else {
      return schemaInstallations
    }
  }

  static _getLabel(version) {
    if (version) {
      return `installs@${version}`
    } else {
      return 'installs'
    }
  }

  async handle({ plugin, version }) {
    const label = this.constructor._getLabel(version)
    const json = await this.fetch({ plugin, version })

    let installs
    if (version) {
      installs = json.installationsPerVersion[version]
      if (!installs) {
        throw new NotFound({
          prettyMessage: 'version not found',
        })
      }
    } else {
      const latestDate = Object.keys(json.installations)
        .sort()
        .slice(-1)[0]
      installs = json.installations[latestDate]
    }

    return this.constructor.render({ label, installs })
  }

  static get defaultBadgeData() {
    return { label: 'installs' }
  }

  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'jenkins/plugin/i',
      format: '([^/]+)/?([^/]+)?',
      capture: ['plugin', 'version'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Jenkins Plugin installs',
        exampleUrl: 'view-job-filters',
        pattern: ':plugin',
        staticExample: this.render({
          label: this._getLabel(),
          installs: 10247,
        }),
      },
      {
        title: 'Jenkins Plugin installs',
        exampleUrl: 'view-job-filters/1.26',
        pattern: ':plugin/:version',
        staticExample: this.render({
          label: this._getLabel('1.26'),
          installs: 955,
        }),
      },
    ]
  }
}

module.exports = JenkinsPluginInstalls
