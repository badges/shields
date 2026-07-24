import { BaseSvgScrapingService, pathParams } from '../index.js'

export default class WakaTimeBadge extends BaseSvgScrapingService {
  static category = 'activity'
  static route = {
    base: 'wakatime',
    pattern: ':type(user|project)/:id',
  }

  static openApi = {
    '/wakatime/{type}/{id}': {
      get: {
        summary: 'WakaTime coding time badge',
        parameters: pathParams(
          {
            name: 'type',
            example: 'user',
            schema: { type: 'string', enum: this.getEnum('type') },
          },
          {
            name: 'id',
            example: '73d84531-5bb3-4938-91c9-5ca9e6507df9',
          },
        ),
      },
    },
  }

  static _cacheLength = 3600

  static defaultBadgeData = {
    label: 'wakatime',
    color: 'blue',
  }

  static render({ message }) {
    return { message, color: 'blue' }
  }

  async fetch({ type, id }) {
    const url = `https://wakatime.com/badge/${type}/${id}.svg`
    const { buffer } = await this._request({ url })
    return { buffer }
  }

  async handle({ type, id }) {
    const { buffer } = await this.fetch({ type, id })
    const match = buffer.match(/>([\d,]+\s+hrs?.*?)</i)
    if (!match) {
      return { message: 'invalid', color: 'red' }
    }
    return this.constructor.render({ message: match[1] })
  }
}
