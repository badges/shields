import { pathParams } from '../index.js'
import { description, YouTubeChannelBase } from './youtube-base.js'

export default class YouTubeSubscribes extends YouTubeChannelBase {
  static route = {
    base: 'youtube/channel/subscribers',
    pattern: ':channelId',
  }

  static openApi = {
    '/youtube/channel/subscribers/{channelId}': {
      get: {
        summary: 'YouTube Channel Subscribers',
        description,
        parameters: pathParams({
          name: 'channelId',
          example: 'UC8butISFwT-Wl7EV0hUK0BQ',
        }),
      },
    },
  }

  static render({ statistics, id }) {
    return super.renderSingleStat({
      statistics,
      statisticName: 'subscriber',
      id,
    })
  }
}
