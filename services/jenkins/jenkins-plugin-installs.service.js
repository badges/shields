'use strict'

const Joi = require('@hapi/joi')
const { downloadCount: downloadCountColor } = require('../color-formatters')
const { metric } = require('../text-formatters')
const { BaseJsonService, NotFound } = require('..')
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

module.exports = class JenkinsPluginInstalls extends BaseJsonService {
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

  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'jenkins/plugin/i',
      pattern: ':plugin/:version?',
    }
  }

  static get examples() {
    return [
      {
        title: 'Jenkins Plugin installs',
        pattern: ':plugin',
        namedParams: {
          plugin: 'view-job-filters',
        },
        staticPreview: this.render({
          label: this._getLabel(),
          installs: 10247,
        }),
      },
      {
        title: 'Jenkins Plugin installs (version)',
        pattern: ':plugin/:version',
        namedParams: {
          plugin: 'view-job-filters',
          version: '1.26',
        },
        staticPreview: this.render({
          label: this._getLabel('1.26'),
          installs: 955,
        }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'installs' }
  }

  static render({ label, installs }) {
    return {
      label,
      message: metric(installs),
      color: downloadCountColor(installs),
    }
  }

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
}
