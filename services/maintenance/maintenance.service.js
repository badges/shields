import { BaseService, pathParams } from '../index.js'

export default class Maintenance extends BaseService {
  static category = 'other'

  static route = {
    base: 'maintenance',
    pattern: ':maintained/:year(\\d{4})',
  }

  static openApi = {
    '/maintenance/{maintained}/{year}': {
      get: {
        summary: 'Maintenance',
        parameters: pathParams(
          {
            name: 'maintained',
            example: 'yes',
          },
          {
            name: 'year',
            example: '2019',
          },
        ),
      },
    },
  }

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
      message: `${isStale ? 'stale' : 'no!'} (as of ${targetYear})`,
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
