'use strict'

const { documentation, YouTubeChannelBase } = require('./youtube-channel-base')

module.exports = class YouTubeChannelViews extends YouTubeChannelBase {
  static route = {
    base: 'youtube/channel/views',
    pattern: ':channelId',
  }

  static get examples() {
    const preview = this.render({
      statistics: { viewCount: 30543 },
      channelId: 'UCTNq28Ah5eyDgsYOA0oHzew',
    })
    // link[] is not allowed in examples
    delete preview.link
    return [
      {
        title: 'YouTube Channel Views',
        namedParams: { channelId: 'UCTNq28Ah5eyDgsYOA0oHzew' },
        staticPreview: preview,
        documentation,
      },
    ]
  }

  static render({ statistics, channelId }) {
    return super.renderSingleStat({
      statistics,
      statisticName: 'view',
      channelId,
    })
  }
}
