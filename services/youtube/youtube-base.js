'use strict'

const Joi = require('joi')
const { BaseJsonService, NotFound } = require('..')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')

const schema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        statistics: Joi.object({
          viewCount: nonNegativeInteger,
          likeCount: nonNegativeInteger,
          dislikeCount: nonNegativeInteger,
          commentCount: nonNegativeInteger,
        }).required(),
      })
    )
    .required(),
}).required()

module.exports = class YouTubeBase extends BaseJsonService {
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

  static renderSingleStat({ statistics, statisticName, videoId }) {
    return {
      label: `${statisticName}s`,
      message: metric(statistics[`${statisticName}Count`]),
      style: 'social',
      link: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
    }
  }

  async fetch({ videoId }) {
    return this._requestJson(
      this.authHelper.withQueryStringAuth(
        { passKey: 'key' },
        {
          schema,
          url: 'https://www.googleapis.com/youtube/v3/videos',
          options: {
            qs: { id: videoId, part: 'statistics' },
          },
        }
      )
    )
  }

  async handle({ videoId }, queryParams) {
    const json = await this.fetch({ videoId })
    if (json.items.length === 0) {
      throw new NotFound({ prettyMessage: 'video not found' })
    }
    const statistics = json.items[0].statistics
    return this.constructor.render({ statistics, videoId }, queryParams)
  }
}
