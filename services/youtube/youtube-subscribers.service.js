'use strict'

const { documentation, YouTubeChannelBase } = require('./youtube-base')

module.exports = class YouTubeSubscribes extends YouTubeChannelBase {
  static route = {
    base: 'youtube/channel/subscribers',
    pattern: ':channelId',
  }

  static get examples() {
    const preview = this.render({
      statistics: { subscriberCount: 14577 },
      id: 'UC8butISFwT-Wl7EV0hUK0BQ',
    })
    // link[] is not allowed in examples
    delete preview.link
    return [
      {
        title: 'YouTube Channel Subscribers',
        namedParams: { channelId: 'UC8butISFwT-Wl7EV0hUK0BQ' },
        staticPreview: preview,
        documentation,
      },
    ]
  }

  static render({ statistics, id }) {
    return super.renderSingleStat({
      statistics,
      statisticName: 'subscriber',
      id,
    })
  }
}
