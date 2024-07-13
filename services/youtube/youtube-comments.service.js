import { pathParams } from '../index.js'
import { description, YouTubeVideoBase } from './youtube-base.js'

export default class YouTubeComments extends YouTubeVideoBase {
  static route = {
    base: 'youtube/comments',
    pattern: ':videoId',
  }

  static openApi = {
    '/youtube/comments/{videoId}': {
      get: {
        summary: 'YouTube Video Comments',
        description,
        parameters: pathParams({
          name: 'videoId',
          example: 'wGJHwc5ksMA',
        }),
      },
    },
  }

  static render({ statistics, id }) {
    return super.renderSingleStat({ statistics, statisticName: 'comment', id })
  }
}
