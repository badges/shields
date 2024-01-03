import { pathParams } from '../index.js'
import { description, YouTubeVideoBase } from './youtube-base.js'

export default class YouTubeViews extends YouTubeVideoBase {
  static route = {
    base: 'youtube/views',
    pattern: ':videoId',
  }

  static openApi = {
    '/youtube/views/{videoId}': {
      get: {
        summary: 'YouTube Video Views',
        description,
        parameters: pathParams({
          name: 'videoId',
          example: 'abBdk8bSPKU',
        }),
      },
    },
  }

  static render({ statistics, id }) {
    return super.renderSingleStat({ statistics, statisticName: 'view', id })
  }
}
