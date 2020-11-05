'use strict'

const YouTubeBase = require('./youtube-base')

module.exports = class YouTubeViews extends YouTubeBase {
  static route = {
    base: 'youtube/views',
    pattern: ':videoId',
  }

  static get examples() {
    const preview = this.render({
      statistics: { viewCount: 14577 },
      videoId: 'abBdk8bSPKU',
    })
    // link[] is not allowed in examples
    delete preview.link
    return [
      {
        title: 'YouTube Video Views',
        namedParams: { videoId: 'abBdk8bSPKU' },
        staticPreview: preview,
      },
    ]
  }

  static render({ statistics, videoId }) {
    return super.renderSingleStat({
      statistics,
      statisticName: 'view',
      videoId,
    })
  }
}
