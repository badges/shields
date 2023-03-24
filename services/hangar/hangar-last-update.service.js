import { BaseHangarService, documentation } from './hangar-base.js'

const isValidDate = d => d instanceof Date && !isNaN(d)

// eslint-disable-next-line jsdoc/require-returns-check
/**
 * Human readable elapsed or remaining time (example: 3 minutes ago)
 *
 * @param  {Date | number | string} date A Date object, timestamp or string parsable with Date.parse()
 * @param  {Date | number | string} [nowDate] A Date object, timestamp or string parsable with Date.parse()
 * @param  {Intl.RelativeTimeFormat} [rft] A Intl formater
 * @returns {string} Human readable elapsed or remaining time
 * @author github.com/victornpb
 * @see https://stackoverflow.com/a/67338038/938822
 */
const fromNow = (
  date,
  nowDate = Date.now(),
  rft = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
) => {
  const SECOND = 1000
  const MINUTE = 60 * SECOND
  const HOUR = 60 * MINUTE
  const DAY = 24 * HOUR
  const WEEK = 7 * DAY
  const MONTH = 30 * DAY
  const YEAR = 365 * DAY
  const intervals = [
    { ge: YEAR, divisor: YEAR, unit: 'year' },
    { ge: MONTH, divisor: MONTH, unit: 'month' },
    { ge: WEEK, divisor: WEEK, unit: 'week' },
    { ge: DAY, divisor: DAY, unit: 'day' },
    { ge: HOUR, divisor: HOUR, unit: 'hour' },
    { ge: MINUTE, divisor: MINUTE, unit: 'minute' },
    { ge: 30 * SECOND, divisor: SECOND, unit: 'seconds' },
    { ge: 0, divisor: 1, text: 'just now' },
  ]
  const now =
    typeof nowDate === 'object'
      ? nowDate.getTime()
      : new Date(nowDate).getTime()
  const diff =
    now - (typeof date === 'object' ? date : new Date(date)).getTime()
  const diffAbs = Math.abs(diff)
  for (const interval of intervals) {
    if (diffAbs >= interval.ge) {
      const x = Math.round(Math.abs(diff) / interval.divisor)
      const isFuture = diff < 0
      return interval.unit
        ? rft.format(isFuture ? x : -x, interval.unit)
        : interval.text
    }
  }
}

export default class HangarLastUpdate extends BaseHangarService {
  static category = 'activity'

  static route = {
    base: 'hangar/last-update',
    pattern: ':author/:slug',
  }

  static examples = [
    {
      title: 'Hangar Last Update',
      namedParams: { author: 'jmp', slug: 'MiniMOTD' },
      // This number has no significance.
      staticPreview: this.render({ date: new Date('2021-02-01') }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'last update',
    color: 'blue',
  }

  static render({ date }) {
    return {
      message: fromNow(date),
    }
  }

  async handle({ author, slug }) {
    const project = `${author}/${slug}`
    const { 0: latestVersion } = (await this.fetchVersions({ project })).result
    const lastestUpdateDate = new Date(latestVersion.createdAt)
    if (!isValidDate(lastestUpdateDate)) {
      return {
        message: 'resource never updated',
        color: 'lightgrey',
      }
    }
    return this.constructor.render({
      date: lastestUpdateDate,
    })
  }
}
