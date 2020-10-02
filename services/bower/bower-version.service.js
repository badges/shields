'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const { InvalidResponse, redirector } = require('..')
const BaseBowerService = require('./bower-base')

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

  async handle({ packageName }, queryParams) {
    const data = await this.fetch({ packageName })
    const includePrereleases = queryParams.include_prereleases !== undefined

    if (includePrereleases) {
      if (data.latest_release_number) {
        return renderVersionBadge({ version: data.latest_release_number })
      }
    } else {
      if (data.latest_stable_release) {
        return renderVersionBadge({ version: data.latest_stable_release.name })
      }
    }
    throw new InvalidResponse({ prettyMessage: 'no releases' })
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

module.exports = { BowerVersion, BowerVersionRedirect }
