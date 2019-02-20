'use strict'

const { NonMemoryCachingBaseService } = require('..')

module.exports = class Maintenance extends NonMemoryCachingBaseService {
  static get route() {
    return {
      base: 'maintenance',
      pattern: ':maintained/:year(\\d{4})',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'maintained',
    }
  }

  async handle({ maintained, year }) {
    const now = new Date()
    const cy = now.getUTCFullYear() // current year.
    const m = now.getUTCMonth() // month.

    if (maintained === 'no') {
      return this.constructor.render({ message: `no! (as of ${year})` })
    } else if (cy <= year) {
      return this.constructor.render({ message: maintained })
    } else if (parseInt(cy) === parseInt(year) + 1 && parseInt(m) < 3) {
      return this.constructor.render({ message: `stale (as of ${cy})` })
    } else {
      return this.constructor.render({ message: `no! (as of ${year})` })
    }
  }

  static render({ message }) {
    if (message.startsWith('yes')) {
      return {
        message,
        color: 'brightgreen',
      }
    } else if (message.startsWith('no')) {
      return {
        message,
        color: 'red',
      }
    } else {
      return { message }
    }
  }

  static get category() {
    return 'other'
  }

  static get examples() {
    return [
      {
        title: 'Maintenance',
        pattern: ':maintained(yes|no)/:year',
        namedParams: {
          maintained: 'yes',
          year: '2019',
        },
        staticPreview: this.render({ message: 'yes' }),
        keywords: ['maintained'],
      },
    ]
  }
}
