import { pathParams } from '../index.js'
import { description, YouTubeChannelBase } from './youtube-base.js'

export default class YouTubeChannelViews extends YouTubeChannelBase {
  static route = {
    base: 'youtube/channel/views',
    pattern: ':channelId',
  }

  static openApi = {
    '/youtube/channel/views/{channelId}': {
      get: {
        summary: 'YouTube Channel Views',
        description,
        parameters: pathParams({
          name: 'channelId',
          example: 'UC8butISFwT-Wl7EV0hUK0BQ',
        }),
      },
    },
  }

  static render({ statistics, id }) {
    return super.renderSingleStat({ statistics, statisticName: 'view', id })
  }
}
