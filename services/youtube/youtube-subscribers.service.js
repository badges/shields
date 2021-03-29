'use strict'

const { documentation, YouTubeChannelBase } = require('./youtube-channel-base')

module.exports = class YouTubeSubscribes extends YouTubeChannelBase {
  static route = {
    base: 'youtube/channel/subscribers',
    pattern: ':channelId',
  }

  static get examples() {
    const preview = this.render({
      statistics: { subscriberCount: 14577 },
      channelId: 'UCTNq28Ah5eyDgsYOA0oHzew',
    })
    // link[] is not allowed in examples
    delete preview.link
    return [
      {
        title: 'YouTube Subscriber Counts',
        namedParams: { channelId: 'UCTNq28Ah5eyDgsYOA0oHzew' },
        staticPreview: preview,
        documentation,
      },
    ]
  }

  static render({ statistics, channelId }) {
    return super.renderSingleStat({
      statistics,
      statisticName: 'subscriber',
      channelId,
    })
  }
}
