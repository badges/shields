import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { InvalidResponse, redirector } from '../index.js'
import BaseBowerService from './bower-base.js'

const queryParamSchema = Joi.object({
  include_prereleases: Joi.equal(''),
}).required()

class BowerVersion extends BaseBowerService {
  static category = 'version'
  static route = { base: 'bower/v', pattern: ':packageName', queryParamSchema }

  static examples = [
    {
      title: 'Bower Version',
      namedParams: { packageName: 'bootstrap' },
      staticPreview: renderVersionBadge({ version: '4.2.1' }),
    },
    {
      title: 'Bower Version (including pre-releases)',
      namedParams: { packageName: 'bootstrap' },
      queryParams: { include_prereleases: null },
      staticPreview: renderVersionBadge({ version: '4.2.1' }),
    },
  ]

  static defaultBadgeData = { label: 'bower' }

  static transform(data, includePrereleases) {
    const version = includePrereleases
      ? data.latest_release_number
      : data.latest_stable_release_number

    if (!version) {
      throw new InvalidResponse({ prettyMessage: 'no releases' })
    }

    return version
  }

  async handle({ packageName }, queryParams) {
    const data = await this.fetch({ packageName })
    const includePrereleases = queryParams.include_prereleases !== undefined
    const version = this.constructor.transform(data, includePrereleases)

    return renderVersionBadge({ version })
  }
}

const BowerVersionRedirect = redirector({
  category: 'version',
  route: {
    base: 'bower/vpre',
    pattern: ':packageName',
  },
  transformPath: ({ packageName }) => `/bower/v/${packageName}`,
  transformQueryParams: params => ({
    include_prereleases: null,
  }),
  dateAdded: new Date('2019-12-15'),
})

export { BowerVersion, BowerVersionRedirect }
