import Joi from 'joi'
import { latest, renderVersionBadge } from '../version.js'
import { BaseJsonService, redirector, pathParam, queryParam } from '../index.js'
import { baseDescription } from './pub-common.js'

const schema = Joi.object({
  versions: Joi.array()
    .items(Joi.object({ version: Joi.string().required() }))
    .required(),
}).required()

const queryParamSchema = Joi.object({
  include_prereleases: Joi.equal(''),
}).required()

class PubVersion extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'pub/v',
    pattern: ':packageName',
    queryParamSchema,
  }

  static openApi = {
    '/pub/v/{packageName}': {
      get: {
        summary: 'Pub Version',
        description: baseDescription,
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'box2d',
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

  static defaultBadgeData = { label: 'pub' }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://pub.dev/api/packages/${packageName}`,
    })
  }

  async handle({ packageName }, queryParams) {
    const data = await this.fetch({ packageName })
    const includePre = queryParams.include_prereleases !== undefined
    const versions = data.versions.map(x => x.version)
    const version = latest(versions, { pre: includePre })
    return renderVersionBadge({ version })
  }
}

const PubVersionRedirector = redirector({
  category: 'version',
  route: {
    base: 'pub/vpre',
    pattern: ':packageName',
  },
  transformPath: ({ packageName }) => `/pub/v/${packageName}`,
  transformQueryParams: params => ({
    include_prereleases: null,
  }),
  dateAdded: new Date('2019-12-15'),
})

export { PubVersion, PubVersionRedirector }
