import Joi from 'joi'
import dayjs from 'dayjs'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'

const schema = Joi.object()
  .pattern(Joi.string(), Joi.object().pattern(Joi.string(), nonNegativeInteger))
  .required()

const NPM_INITIAL_RELEASE_DATE = '2010-01-12'

const intervalMap = {
  dw: { interval: 'week' },
  dm: { interval: 'month' },
  dy: { interval: 'year' },
  dt: {},
}

export default class NpmStatDownloads extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'npm-stat',
    pattern: ':interval(dw|dm|dy|dt)/:author',
  }

  static examples = [
    {
      title: 'npm (by author)',
      documentation:
        'The total number of downloads of npm packages published by the specified author from [npm-stat](https://npm-stat.com).',
      namedParams: { interval: 'dy', author: 'dukeluo' },
      staticPreview: this.render({ interval: 'dy', downloadCount: 30000 }),
      keywords: ['node'],
    },
  ]

  static _cacheLength = 21600

  static defaultBadgeData = { label: 'downloads' }

  static getTotalDownloads(data) {
    const add = (x, y) => x + y
    const sum = nums => nums.reduce(add, 0)

    return Object.values(data).reduce(
      (count, packageDownloads) => count + sum(Object.values(packageDownloads)),
      0,
    )
  }

  static render({ interval, downloads }) {
    return renderDownloadsBadge({
      downloads,
      interval: intervalMap[interval].interval,
      colorOverride: downloads > 0 ? 'brightgreen' : 'red',
    })
  }

  async handle({ interval, author }) {
    const unit = intervalMap[interval].interval
    const today = dayjs()
    const until = today.format('YYYY-MM-DD')
    const from = unit
      ? today.subtract(1, unit).format('YYYY-MM-DD')
      : NPM_INITIAL_RELEASE_DATE
    const data = await this._requestJson({
      url: `https://npm-stat.com/api/download-counts?author=${author}&from=${from}&until=${until}`,
      schema,
    })
    const downloads = this.constructor.getTotalDownloads(data)

    return this.constructor.render({ interval, downloads })
  }
}
