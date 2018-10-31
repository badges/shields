'use strict'

const BaseService = require('../base')
const { formatRelativeDate } = require('../../lib/text-formatters')

module.exports = class Date extends BaseService {
  static render({ relativeDateString }) {
    return {
      message: relativeDateString,
      color: relativeDateString === 'invalid date' ? 'red' : 'blue',
    }
  }

  async handle({ timestamp }) {
    return this.constructor.render({
      relativeDateString: formatRelativeDate(timestamp),
    })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'date' }
  }

  static get category() {
    return 'other'
  }

  static get url() {
    return {
      base: 'date',
      format: '([0-9]+)',
      capture: ['timestamp'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Relative date',
        urlPattern: ':timestamp',
        staticExample: this.render({ relativeDateString: '2 days ago' }),
        exampleUrl: '1540814400000',
        keywords: ['date', 'time', 'countdown', 'countup', 'moment'],
      },
    ]
  }
}
