import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const keywords = ['sublime', 'sublimetext', 'packagecontrol']

const schema = Joi.object({
  installs: Joi.object({
    total: nonNegativeInteger,
    daily: Joi.object({
      data: Joi.array()
        .items(
          Joi.object({
            totals: Joi.array().items(nonNegativeInteger).required(),
          }).required()
        )
        .required(),
    }).required(),
  }).required(),
})

function DownloadsForInterval(downloadInterval) {
  const { base, interval, transform, name } = {
    day: {
      base: 'packagecontrol/dd',
      interval: 'day',
      transform: resp => {
        const platforms = resp.installs.daily.data
        let downloads = 0
        platforms.forEach(platform => {
          // use the downloads from yesterday
          downloads += platform.totals[1]
        })
        return downloads
      },
      name: 'PackageControlDownloadsDay',
    },
    week: {
      base: 'packagecontrol/dw',
      interval: 'week',
      transform: resp => {
        const platforms = resp.installs.daily.data
        let downloads = 0
        platforms.forEach(platform => {
          // total for the first 7 days
          for (let i = 0; i < 7; i++) {
            downloads += platform.totals[i]
          }
        })
        return downloads
      },
      name: 'PackageControlDownloadsWeek',
    },
    month: {
      base: 'packagecontrol/dm',
      interval: 'month',
      transform: resp => {
        const platforms = resp.installs.daily.data
        let downloads = 0
        platforms.forEach(platform => {
          // total for the first 30 days
          for (let i = 0; i < 30; i++) {
            downloads += platform.totals[i]
          }
        })
        return downloads
      },
      name: 'PackageControlDownloadsMonth',
    },
    total: {
      base: 'packagecontrol/dt',
      transform: resp => resp.installs.total,
      name: 'PackageControlDownloadsTotal',
    },
  }[downloadInterval]

  return class PackageControlDownloads extends BaseJsonService {
    static name = name

    static category = 'downloads'

    static route = { base, pattern: ':packageName' }

    static examples = [
      {
        title: 'Package Control',
        namedParams: { packageName: 'GitGutter' },
        staticPreview: renderDownloadsBadge({ downloads: 12000 }),
        keywords,
      },
    ]

    static defaultBadgeData = { label: 'downloads' }

    async fetch({ packageName }) {
      const url = `https://packagecontrol.io/packages/${packageName}.json`
      return this._requestJson({ schema, url })
    }

    async handle({ packageName }) {
      const data = await this.fetch({ packageName })
      return renderDownloadsBadge({
        downloads: transform(data),
        interval,
      })
    }
  }
}

export default ['day', 'week', 'month', 'total'].map(DownloadsForInterval)
