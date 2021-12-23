import { documentation, YouTubeVideoBase } from './youtube-base.js'

export default class YouTubeLikes extends YouTubeVideoBase {
  static route = {
    base: 'youtube/likes',
    pattern: ':videoId',
  }

  static get examples() {
    const previewLikes = this.render({
      statistics: { likeCount: 7 },
      id: 'abBdk8bSPKU',
    })
    // link[] is not allowed in examples
    delete previewLikes.link
    return [
      {
        title: 'YouTube Video Likes',
        namedParams: { videoId: 'abBdk8bSPKU' },
        staticPreview: previewLikes,
        documentation,
      },
    ]
  }

  static render({ statistics, id }, queryParams) {
    const renderedBadge = super.renderSingleStat({
      statistics,
      statisticName: 'like',
      id,
    })
    return renderedBadge
  }
}
