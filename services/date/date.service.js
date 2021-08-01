import { formatRelativeDate } from '../text-formatters.js'
import { BaseService } from '../index.js'

const documentation = `
<p>
  Supply a unix timestamp in seconds to display the relative time from/to now
</p>
`

export default class Date extends BaseService {
  static category = 'other'
  static route = { base: 'date', pattern: ':timestamp([0-9]+)' }

  static examples = [
    {
      title: 'Relative date',
      pattern: ':timestamp',
      namedParams: { timestamp: '1540814400' },
      staticPreview: this.render({ relativeDateString: '2 days ago' }),
      keywords: ['time', 'countdown', 'countup', 'moment'],
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'date' }

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
