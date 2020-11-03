'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const YouTubeBase = require('./youtube-base')

const queryParamSchema = Joi.object({
  withDislikes: Joi.equal(''),
}).required()

module.exports = class YouTubeLikes extends YouTubeBase {
  static route = {
    base: 'youtube/likes',
    pattern: ':videoId',
    queryParamSchema,
  }

  static get examples() {
    const previewLikes = this.render({
      statistics: { likeCount: 7 },
      videoId: 'abBdk8bSPKU',
    })
    const previewVotes = this.render(
      {
        statistics: { likeCount: 10236, dislikeCount: 396 },
        videoId: 'pU9Q6oiQNd0',
      },
      {
        withDislikes: '',
      }
    )
    // link[] is not allowed in examples
    delete previewLikes.link
    delete previewVotes.link
    return [
      {
        title: 'YouTube Video Likes',
        namedParams: { videoId: 'abBdk8bSPKU' },
        staticPreview: previewLikes,
      },
      {
        title: 'YouTube Video Votes',
        namedParams: { videoId: 'pU9Q6oiQNd0' },
        staticPreview: previewVotes,
        queryParams: {
          withDislikes: null,
        },
      },
    ]
  }

  static render({ statistics, videoId }, queryParams) {
    if (queryParams && typeof queryParams.withDislikes !== 'undefined') {
      return {
        label: 'votes',
        message: `${metric(statistics.likeCount)} 👍 ${metric(
          statistics.dislikeCount
        )} 👎`,
        style: 'social',
        link: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      }
    }
    return super.renderSingleStat({
      statistics,
      statisticName: 'like',
      videoId,
    })
  }
}
