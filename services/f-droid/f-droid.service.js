import Joi from 'joi'
import {
  optionalNonNegativeInteger,
  nonNegativeInteger,
} from '../validators.js'
import { addv } from '../text-formatters.js'
import { version as versionColor } from '../color-formatters.js'
import { BaseJsonService, NotFound } from '../index.js'

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

export default class FDroid extends BaseJsonService {
  static category = 'version'
  static route = { base: 'f-droid/v', pattern: ':appId', queryParamSchema }
  static examples = [
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

  static defaultBadgeData = { label: 'f-droid' }

  static render({ version }) {
    return {
      message: addv(version),
      color: versionColor(version),
    }
  }

  async fetch({ appId }) {
    const url = `https://f-droid.org/api/v1/packages/${appId}`
    return this._requestJson({
      schema,
      url,
      errorMessages: {
        403: 'app not found',
        404: 'app not found',
      },
    })
  }

  transform({ json, suggested }) {
    const svc = suggested && json.suggestedVersionCode
    const packages = (json.packages || []).filter(
      ({ versionCode }) => !svc || versionCode <= svc
    )
    if (packages.length === 0) {
      throw new NotFound({ prettyMessage: 'no packages found' })
    }
    const version = packages.reduce((a, b) =>
      a.versionCode > b.versionCode ? a : b
    ).versionName
    return { version }
  }

  async handle({ appId }, { include_prereleases: includePre }) {
    const json = await this.fetch({ appId })
    const suggested = includePre === undefined
    const { version } = this.transform({ json, suggested })
    return this.constructor.render({ version })
  }
}
