'use strict'

const YouTubeBase = require('./youtube-base')

module.exports = class YouTubeComments extends YouTubeBase {
  static route = {
    base: 'youtube/comments',
    pattern: ':videoId',
  }

  static get examples() {
    const preview = this.render({
      statistics: { commentCount: 209 },
      videoId: 'wGJHwc5ksMA',
    })
    // link[] is not allowed in examples
    delete preview.link
    return [
      {
        title: 'YouTube Video Comments',
        namedParams: { videoId: 'wGJHwc5ksMA' },
        staticPreview: preview,
      },
    ]
  }

  static render({ statistics, videoId }) {
    return super.renderSingleStat({
      statistics,
      statisticName: 'comment',
      videoId,
    })
  }
}
