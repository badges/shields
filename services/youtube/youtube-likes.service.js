'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { documentation, YouTubeVideoBase } = require('./youtube-video-base')

const documentationWithDislikes = `
  ${documentation}
  <p>
    When enabling the <code>withDislikes</code> option, 👍 corresponds to the number
    of likes of a given video, 👎 corresponds to the number of dislikes.
  </p>
`

const queryParamSchema = Joi.object({
  withDislikes: Joi.equal(''),
}).required()

module.exports = class YouTubeLikes extends YouTubeVideoBase {
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
        documentation,
      },
      {
        title: 'YouTube Video Likes and Dislikes',
        namedParams: { videoId: 'pU9Q6oiQNd0' },
        staticPreview: previewVotes,
        queryParams: {
          withDislikes: null,
        },
        documentation: documentationWithDislikes,
      },
    ]
  }

  static render({ statistics, videoId }, queryParams) {
    let renderedBadge = super.renderSingleStat({
      statistics,
      statisticName: 'like',
      videoId,
    })
    if (queryParams && typeof queryParams.withDislikes !== 'undefined') {
      renderedBadge = {
        ...renderedBadge,
        message: `${metric(statistics.likeCount)} 👍 ${metric(
          statistics.dislikeCount
        )} 👎`,
      }
    }
    return renderedBadge
  }
}
