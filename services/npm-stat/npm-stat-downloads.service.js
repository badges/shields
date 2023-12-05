import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'

const schema = Joi.object()
  .pattern(Joi.string(), Joi.object().pattern(Joi.string(), nonNegativeInteger))
  .required()

const NPM_INITIAL_RELEASE_DATE = '2010-01-12'

const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24
const MILLISECONDS_IN_A_WEEK = MILLISECONDS_IN_A_DAY * 7
const MILLISECONDS_IN_A_MONTH = MILLISECONDS_IN_A_DAY * 30
const MILLISECONDS_IN_A_YEAR = MILLISECONDS_IN_A_DAY * 365

const intervalMap = {
  dw: { interval: 'week', difference: MILLISECONDS_IN_A_WEEK },
  dm: { interval: 'month', difference: MILLISECONDS_IN_A_MONTH },
  dy: { interval: 'year', difference: MILLISECONDS_IN_A_YEAR },
  dt: { difference: -1 },
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
        'The total number of downloads of npm packages published by the specified author.',
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
    const format = date => date.toISOString().split('T')[0]

    const { difference } = intervalMap[interval]
    const today = new Date()
    const until = format(today)
    const from =
      difference > 0
        ? format(new Date(today.getTime() - difference))
        : NPM_INITIAL_RELEASE_DATE
    const data = await this._requestJson({
      url: `https://npm-stat.com/api/download-counts?author=${author}&from=${from}&until=${until}`,
      schema,
    })
    const downloads = this.constructor.getTotalDownloads(data)

    return this.constructor.render({ interval, downloads })
  }
}
