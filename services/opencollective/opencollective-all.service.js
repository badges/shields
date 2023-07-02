import OpencollectiveBase from './opencollective-base.js'

export default class OpencollectiveAll extends OpencollectiveBase {
  static route = this.buildRoute('all')

  static examples = [
    {
      title: 'Open Collective backers and sponsors',
      namedParams: { collective: 'shields' },
      staticPreview: this.render(35),
      keywords: ['opencollective'],
    },
  ]

  static defaultBadgeData = {
    label: 'backers and sponsors',
  }

  async handle({ collective }) {
    const data = await this.fetchCollectiveInfo({
      collective,
      accountType: ['INDIVIDUAL', 'ORGANIZATION'],
    })
    const backersCount = this.getCnt(data)
    return this.constructor.render(backersCount)
  }
}
