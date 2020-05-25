'use strict'

const Joi = require('@hapi/joi')
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

module.exports = class YouTube extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'youtube',
      pattern: ':statistic(view|like|dislike|comment)/:videoId',
    }
  }

  static get auth() {
    return {
      passKey: 'youtube_api_key',
      authorizedOrigins: ['https://www.googleapis.com'],
      isRequired: true,
    }
  }

  static get examples() {
    const preview = this.render({
      statistic: 'view',
      videoId: 'abBdk8bSPKU',
      count: 251,
    })
    // link[] is not allowed in examples
    delete preview.link
    return [
      {
        title: 'YouTube Video',
        namedParams: { statistic: 'view', videoId: 'abBdk8bSPKU' },
        staticPreview: preview,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'youtube' }
  }

  static render({ statistic, videoId, count }) {
    return {
      label: `${statistic}s`,
      message: metric(count),
      color: 'red',
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

  async handle({ statistic, videoId }) {
    const json = await this.fetch({ videoId })
    if (json.items.length === 0) {
      throw new NotFound({ prettyMessage: 'video not found' })
    }
    const count = json.items[0].statistics[`${statistic}Count`]
    return this.constructor.render({ statistic, videoId, count })
  }
}
