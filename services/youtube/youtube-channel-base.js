'use strict'

const Joi = require('joi')
const { BaseJsonService, NotFound } = require('..')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')

const documentation = `
<p>By using the YouTube badges provided by Shields.io, you are agreeing to be bound by the YouTube Terms of Service. These can be found here:
<code>https://www.youtube.com/t/terms</code></p>`

const schema = Joi.object({
  pageInfo: Joi.object({
    totalResults: nonNegativeInteger,
    resultsPerPage: nonNegativeInteger,
  }).required(),
  items: Joi.array().items(
    Joi.object({
      statistics: Joi.object({
        viewCount: nonNegativeInteger,
        subscriberCount: nonNegativeInteger,
        hiddenSubscriberCount: Joi.boolean().required(),
        videoCount: nonNegativeInteger,
      }).required(),
    })
  ),
}).required()

class YouTubeChannelBase extends BaseJsonService {
  static category = 'social'

  static auth = {
    passKey: 'youtube_api_key',
    authorizedOrigins: ['https://youtube.googleapis.com'],
    isRequired: true,
  }

  static defaultBadgeData = {
    label: 'youtube',
    color: 'red',
    namedLogo: 'youtube',
  }

  static renderSingleStat({ statistics, statisticName, channelId }) {
    return {
      label: `${statisticName}s`,
      message: metric(statistics[`${statisticName}Count`]),
      style: 'social',
      link: `https://www.youtube.com/channel/${encodeURIComponent(channelId)}`,
    }
  }

  async fetch({ channelId }) {
    return this._requestJson(
      this.authHelper.withQueryStringAuth(
        { passKey: 'key' },
        {
          schema,
          url: 'https://youtube.googleapis.com/youtube/v3/channels',
          options: {
            qs: { id: channelId, part: 'statistics' },
          },
        }
      )
    )
  }

  async handle({ channelId }, queryParams) {
    const json = await this.fetch({ channelId })
    console.log(JSON.stringify(json))
    if (json.pageInfo.totalResults === 0) {
      throw new NotFound({ prettyMessage: 'channel not found' })
    }
    const statistics = json.items[0].statistics
    return this.constructor.render({ statistics, channelId }, queryParams)
  }
}

module.exports = { documentation, YouTubeChannelBase }
