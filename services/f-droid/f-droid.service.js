'use strict'

const Joi = require('@hapi/joi')
const {
  optionalNonNegativeInteger,
  nonNegativeInteger,
} = require('../validators')
const { addv } = require('../text-formatters')
const { version: versionColor } = require('../color-formatters')
const { BaseJsonService, NotFound } = require('..')

const schema = Joi.object({
  packageName: Joi.string().required(),
  suggestedVersionCode: optionalNonNegativeInteger,
  packages: Joi.array().items({
    versionName: Joi.string().required(),
    versionCode: nonNegativeInteger,
  }),
}).required()

const queryParamSchema = Joi.object({
  include_prereleases: Joi.equal(''),
}).required()

module.exports = class FDroid extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'f-droid/v',
      pattern: ':appId',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'F-Droid',
        namedParams: { appId: 'org.thosp.yourlocalweather' },
        staticPreview: this.render({ version: '1.0' }),
        keywords: ['fdroid', 'android', 'app'],
      },
      {
        title: 'F-Droid (including pre-releases)',
        namedParams: { appId: 'org.dystopia.email' },
        queryParams: { include_prereleases: null },
        staticPreview: this.render({ version: '1.2.1' }),
        keywords: ['fdroid', 'android', 'app'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'f-droid' }
  }

  static render({ version }) {
    return {
      message: addv(version),
      color: versionColor(version),
    }
  }

  async fetch({ appId }) {
    const url = `https://gitlab.com/kitsunyan/fdroidapi/raw/master/applications/${appId}`
    return this._requestJson({
      schema,
      url,
      errorMessages: {
        403: 'app not found',
        404: 'app not found',
      },
    })
  }

  async handle({ appId }, { include_prereleases: prereleases }) {
    const json = await this.fetch({ appId })
    const svc = prereleases === undefined && json.suggestedVersionCode
    const packages = (json.packages || []).filter(
      ({ versionCode }) => !svc || versionCode <= svc
    )
    if (packages.length === 0) {
      throw new NotFound({ prettyMessage: 'no packages found' })
    }
    const version = packages.reduce((a, b) =>
      a.versionCode > b.versionCode ? a : b
    ).versionName
    return this.constructor.render({ version })
  }
}
