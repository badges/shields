'use strict'

const { documentation, YouTubeVideoBase } = require('./youtube-video-base')

module.exports = class YouTubeViews extends YouTubeVideoBase {
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
        documentation,
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
