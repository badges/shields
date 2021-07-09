import { BaseService } from '../index.js'

export default class Maintenance extends BaseService {
  static category = 'other'

  static route = {
    base: 'maintenance',
    pattern: ':maintained/:year(\\d{4})',
  }

  static examples = [
    {
      title: 'Maintenance',
      pattern: ':maintained(yes|no)/:year',
      namedParams: {
        maintained: 'yes',
        year: '2019',
      },
      staticPreview: this.render({ isMaintained: false, targetYear: '2018' }),
      keywords: ['maintained'],
    },
  ]

  static defaultBadgeData = {
    label: 'maintained',
  }

  static render({ isMaintained, isStale, targetYear, message }) {
    if (isMaintained) {
      return {
        message,
        color: 'brightgreen',
      }
    }

    return {
      message: `${isStale ? `stale` : 'no!'} (as of ${targetYear})`,
      color: isStale ? undefined : 'red',
    }
  }

  transform({ maintained, year, currentYear, month }) {
    if (maintained === 'no') {
      return { isMaintained: false, targetYear: year }
    } else if (currentYear <= year) {
      return { isMaintained: true }
    } else if (
      parseInt(currentYear) === parseInt(year) + 1 &&
      parseInt(month) < 3
    ) {
      return { isStale: true, targetYear: currentYear }
    } else {
      return { isMaintained: false, targetYear: year }
    }
  }

  async handle({ maintained, year }) {
    const now = new Date()
    const currentYear = now.getUTCFullYear() // current year.
    const month = now.getUTCMonth() // month.

    const { isMaintained, isStale, targetYear } = this.transform({
      maintained,
      year,
      currentYear,
      month,
    })
    return this.constructor.render({
      isMaintained,
      isStale,
      targetYear,
      message: maintained,
    })
  }
}
