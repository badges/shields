import { formatRelativeDate } from '../date.js'
import { BaseService, pathParams } from '../index.js'

const description = `
Supply a unix timestamp in seconds to display the relative time from/to now
`

export default class Date extends BaseService {
  static category = 'other'
  static route = { base: 'date', pattern: ':timestamp(-?[0-9]+)' }

  static openApi = {
    '/date/{timestamp}': {
      get: {
        summary: 'Relative date',
        description,
        parameters: pathParams({
          name: 'timestamp',
          example: '1540814400',
        }),
      },
    },
  }

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
