import { documentation, YouTubeVideoBase } from './youtube-base.js'

export default class YouTubeViews extends YouTubeVideoBase {
  static route = {
    base: 'youtube/views',
    pattern: ':videoId',
  }

  static get examples() {
    const preview = this.render({
      statistics: { viewCount: 14577 },
      id: 'abBdk8bSPKU',
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

  static render({ statistics, id }) {
    return super.renderSingleStat({ statistics, statisticName: 'view', id })
  }
}
