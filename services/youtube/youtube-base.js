'use strict'

const Joi = require('joi')
const { BaseJsonService, NotFound } = require('..')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')

const documentation = `
<p>By using the YouTube badges provided by Shields.io, you are agreeing to be bound by the YouTube Terms of Service. These can be found here:
<code>https://www.youtube.com/t/terms</code></p>`

const channelSchema = Joi.object({
  pageInfo: Joi.object({
    totalResults: nonNegativeInteger,
    resultsPerPage: nonNegativeInteger,
  }).required(),
  items: Joi.array().items(
    Joi.object({
      statistics: Joi.object({
        viewCount: nonNegativeInteger,
        subscriberCount: nonNegativeInteger,
      }),
    })
  ),
}).required()

const videoSchema = Joi.object({
  pageInfo: Joi.object({
    totalResults: nonNegativeInteger,
    resultsPerPage: nonNegativeInteger,
  }).required(),
  items: Joi.array().items(
    Joi.object({
      statistics: Joi.object({
        viewCount: nonNegativeInteger,
        likeCount: nonNegativeInteger,
        dislikeCount: nonNegativeInteger,
        commentCount: nonNegativeInteger,
      }),
    })
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

  static renderSingleStat({ statistics, statisticName, channelId, videoId }) {
    let link = ''
    if (channelId) {
      link = `https://www.youtube.com/channel/${encodeURIComponent(channelId)}`
    }
    if (videoId) {
      link = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
    }
    return {
      label: `${statisticName}s`,
      message: metric(statistics[`${statisticName}Count`]),
      style: 'social',
      link,
    }
  }

  async fetch({ channelId, videoId }) {
    let schema, url
    if (channelId) {
      schema = channelSchema
      url = 'https://www.googleapis.com/youtube/v3/channels'
    }
    if (videoId) {
      schema = videoSchema
      url = `https://www.googleapis.com/youtube/v3/videos`
    }
    return this._requestJson(
      this.authHelper.withQueryStringAuth(
        { passKey: 'key' },
        {
          schema,
          url,
          options: {
            qs: { id: channelId || videoId, part: 'statistics' },
          },
        }
      )
    )
  }

  async handle({ channelId, videoId }, queryParams) {
    const json = await this.fetch({ channelId, videoId })
    if (json.pageInfo.totalResults === 0) {
      if (channelId) {
        throw new NotFound({ prettyMessage: 'channel not found' })
      }
      if (videoId) {
        throw new NotFound({ prettyMessage: 'video not found' })
      }
    }
    const statistics = json.items[0].statistics
    return this.constructor.render(
      { statistics, channelId, videoId },
      queryParams
    )
  }
}

module.exports = { documentation, YouTubeBase }
