import { pathParams } from '../index.js'
import { description, YouTubeVideoBase } from './youtube-base.js'

export default class YouTubeLikes extends YouTubeVideoBase {
  static route = {
    base: 'youtube/likes',
    pattern: ':videoId',
  }

  static openApi = {
    '/youtube/likes/{videoId}': {
      get: {
        summary: 'YouTube Video Likes',
        description,
        parameters: pathParams({
          name: 'videoId',
          example: 'abBdk8bSPKU',
        }),
      },
    },
  }

  static render({ statistics, id }) {
    return super.renderSingleStat({
      statistics,
      statisticName: 'like',
      id,
    })
  }
}
