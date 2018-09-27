'use strict'

const Joi = require('joi')

const BaseJsonService = require('../base-json')
const { NotFound, InvalidParameter } = require('../errors')
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
    return this._requestJson({ url, schema })
  }

  static render({ label, installs }) {
    return {
      label: label,
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
      return 'installs@' + version
    } else {
      return 'installs'
    }
  }

  async handle({ info, plugin, version }) {
    const label = this.constructor._getLabel(version)
    const json = await this.fetch({ plugin, version })

    let installs
    if (info === 'iv') {
      installs = json.installationsPerVersion[version]
      if (!installs) {
        throw new NotFound({
          underlyingError: new Error('non-existent version'),
        })
      }
    } else if (info === 'i') {
      const latestDate = Object.keys(json.installations)
        .sort()
        .slice(-1)[0]
      installs = json.installations[latestDate]
    } else {
      throw new InvalidParameter({
        underlyingError: new Error('invalid info'),
      })
    }

    return this.constructor.render({ label, installs })
  }

  static get defaultBadgeData() {
    return { label: 'installs' }
  }

  static get category() {
    return 'downloads'
  }

  static get url() {
    return {
      base: 'jenkins/plugin',
      format: '(i|iv)/([^/]+)/?([^/]+)?',
      capture: ['info', 'plugin', 'version'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Jenkins Plugin installs',
        exampleUrl: 'i/view-job-filters',
        urlPattern: 'i/:plugin',
        staticExample: this.render({
          label: this._getLabel(),
          installs: 10247,
        }),
        keywords: ['jenkins'],
      },
      {
        title: 'Jenkins Plugin installs',
        exampleUrl: 'iv/view-job-filters/1.26',
        urlPattern: 'iv/:plugin/:version',
        staticExample: this.render({
          label: this._getLabel('1.26'),
          installs: 955,
        }),
        keywords: ['jenkins'],
      },
    ]
  }
}

module.exports = JenkinsPluginInstalls
