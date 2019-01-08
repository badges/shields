'use strict'

const BaseService = require('../base')
const { formatRelativeDate } = require('../../lib/text-formatters')

const documentation = `
<p>
  Supply a unix timestamp in seconds to display the relative time from/to now
</p>
`

module.exports = class Date extends BaseService {
  static render({ relativeDateString }) {
    return {
      message: relativeDateString,
      color: relativeDateString === 'invalid date' ? 'grey' : 'blue',
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

  static get route() {
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
        pattern: ':timestamp',
        namedParams: { timestamp: '1540814400' },
        staticPreview: this.render({ relativeDateString: '2 days ago' }),
        keywords: ['date', 'time', 'countdown', 'countup', 'moment'],
        documentation,
      },
    ]
  }
}
