import { documentation, YouTubeVideoBase } from './youtube-base.js'

export default class YouTubeComments extends YouTubeVideoBase {
  static route = {
    base: 'youtube/comments',
    pattern: ':videoId',
  }

  static get examples() {
    const preview = this.render({
      statistics: { commentCount: 209 },
      id: 'wGJHwc5ksMA',
    })
    // link[] is not allowed in examples
    delete preview.link
    return [
      {
        title: 'YouTube Video Comments',
        namedParams: { videoId: 'wGJHwc5ksMA' },
        staticPreview: preview,
        documentation,
      },
    ]
  }

  static render({ statistics, id }) {
    return super.renderSingleStat({ statistics, statisticName: 'comment', id })
  }
}
