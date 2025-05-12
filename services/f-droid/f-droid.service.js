import Joi from 'joi'
import {
  optionalNonNegativeInteger,
  nonNegativeInteger,
  optionalUrl,
} from '../validators.js'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, NotFound, pathParam, queryParam } from '../index.js'

const schema = Joi.object({
  packageName: Joi.string().required(),
  suggestedVersionCode: optionalNonNegativeInteger,
  packages: Joi.array().items({
    versionName: Joi.string().required(),
    versionCode: nonNegativeInteger,
  }),
}).required()

const queryParamSchema = Joi.object({
  baseUrl: optionalUrl,
  include_prereleases: Joi.equal(''),
}).required()

export default class FDroid extends BaseJsonService {
  static category = 'version'
  static route = { base: 'f-droid/v', pattern: ':appId', queryParamSchema }
  static openApi = {
    '/f-droid/v/{appId}': {
      get: {
        summary: 'F-Droid Version',
        description: `
          [F-Droid](https://f-droid.org/) is a catalogue of Open Source Android apps.

          This badge by default uses <code>f-droid.org</code>, but also supports custom repos.
          `,
        parameters: [
          pathParam({
            name: 'appId',
            example: 'org.dystopia.email',
          }),
          queryParam({
            name: 'baseUrl',
            example: 'https://apt.izzysoft.de/fdroid',
            description:
              'URL of a third party F-Droid server. If the API is not located at root path, specify the additional path to the API.',
          }),
          queryParam({
            name: 'include_prereleases',
            schema: { type: 'boolean' },
            example: null,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'f-droid' }

  async fetch({ baseUrl, appId }) {
    baseUrl = baseUrl.replace(/\/$/, '')
    const url = `${baseUrl}/api/v1/packages/${appId}`
    return this._requestJson({
      schema,
      url,
      httpErrors: {
        403: 'app not found',
        404: 'app not found',
      },
    })
  }

  transform({ json, suggested }) {
    const svc = suggested && json.suggestedVersionCode
    const packages = (json.packages || []).filter(
      ({ versionCode }) => !svc || versionCode <= svc,
    )
    if (packages.length === 0) {
      throw new NotFound({ prettyMessage: 'no packages found' })
    }
    const version = packages.reduce((a, b) =>
      a.versionCode > b.versionCode ? a : b,
    ).versionName
    return { version }
  }

  async handle(
    { appId },
    { baseUrl = 'https://f-droid.org', include_prereleases: includePre },
  ) {
    const json = await this.fetch({ baseUrl, appId })
    const suggested = includePre === undefined
    const { version } = this.transform({ json, suggested })
    return renderVersionBadge({ version })
  }
}
