import Joi from 'joi'
import { BaseJsonService, NotFound } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'

const description = `
The YouTube badges provided by Shields.io leverage the YouTube API Services. By using this badge, you are:
* agreeing to be bound by the YouTube Terms of Service, which can be found here: [https://www.youtube.com/t/terms](https://www.youtube.com/t/terms)
* acknowledging and accepting the Google Privacy Policy, which can be found here: [https://policies.google.com/privacy](https://policies.google.com/privacy)
`

const schema = Joi.object({
  pageInfo: Joi.object({
    totalResults: nonNegativeInteger,
    resultsPerPage: nonNegativeInteger,
  }).required(),
  items: Joi.array().items(
    Joi.object({
      statistics: Joi.alternatives(
        Joi.object({
          viewCount: nonNegativeInteger,
          likeCount: nonNegativeInteger,
          commentCount: nonNegativeInteger,
        }),
        Joi.object({
          viewCount: nonNegativeInteger,
          subscriberCount: nonNegativeInteger,
        }),
      ),
    }),
  ),
}).required()

class YouTubeBase extends BaseJsonService {
  static category = 'social'

  static auth = {
    passKey: 'youtube_api_key',
    authorizedOrigins: ['https://www.googleapis.com'],
    isRequired: true,
  }

  static defaultBadgeData = {
    label: 'youtube',
    color: 'red',
    namedLogo: 'youtube',
  }

  static renderSingleStat({ statistics, statisticName, id }) {
    return {
      label: `${statisticName}s`,
      message: metric(statistics[`${statisticName}Count`]),
      style: 'social',
      link: `https://www.youtube.com/${this.type}/${encodeURIComponent(id)}`,
    }
  }

  async fetch({ id }) {
    return this._requestJson(
      this.authHelper.withQueryStringAuth(
        { passKey: 'key' },
        {
          schema,
          url: `https://www.googleapis.com/youtube/v3/${this.constructor.type}s`,
          options: {
            searchParams: { id, part: 'statistics' },
          },
        },
      ),
    )
  }

  async handle({ channelId, videoId }) {
    const id = channelId || videoId
    const json = await this.fetch({ id })
    if (json.pageInfo.totalResults === 0) {
      throw new NotFound({
        prettyMessage: `${this.constructor.type} not found`,
      })
    }
    const statistics = json.items[0].statistics
    return this.constructor.render({ statistics, id })
  }
}

class YouTubeVideoBase extends YouTubeBase {
  static type = 'video'
}

class YouTubeChannelBase extends YouTubeBase {
  static type = 'channel'
}

export { description, YouTubeVideoBase, YouTubeChannelBase }
