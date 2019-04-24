'use strict'

const { formatRelativeDate } = require('../text-formatters')
const { BaseService } = require('..')

const documentation = `
<p>
  Supply a unix timestamp in seconds to display the relative time from/to now
</p>
`

module.exports = class Date extends BaseService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'date',
      pattern: ':timestamp([0-9]+)',
    }
  }

  static get examples() {
    return [
      {
        title: 'Relative date',
        pattern: ':timestamp',
        namedParams: { timestamp: '1540814400' },
        staticPreview: this.render({ relativeDateString: '2 days ago' }),
        keywords: ['time', 'countdown', 'countup', 'moment'],
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'date' }
  }

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
}
