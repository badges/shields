import Joi from 'joi'
import { latest, renderVersionBadge } from '../version.js'
import { BaseJsonService, redirector } from '../index.js'

const schema = Joi.object({
  versions: Joi.array().items(Joi.string()).required(),
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

  static examples = [
    {
      title: 'Pub Version',
      namedParams: { packageName: 'box2d' },
      staticPreview: renderVersionBadge({ version: 'v0.4.0' }),
      keywords: ['dart', 'dartlang'],
    },
    {
      title: 'Pub Version (including pre-releases)',
      namedParams: { packageName: 'box2d' },
      queryParams: { include_prereleases: null },
      staticPreview: renderVersionBadge({ version: 'v0.4.0' }),
      keywords: ['dart', 'dartlang'],
    },
  ]

  static defaultBadgeData = { label: 'pub' }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://pub.dartlang.org/packages/${packageName}.json`,
    })
  }

  async handle({ packageName }, queryParams) {
    const data = await this.fetch({ packageName })
    const includePre = queryParams.include_prereleases !== undefined
    const versions = data.versions
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
