import OpencollectiveBase from './opencollective-base.js'

export default class OpencollectiveSponsors extends OpencollectiveBase {
  static route = this.buildRoute('sponsors')

  static examples = [
    {
      title: 'Open Collective sponsors',
      namedParams: { collective: 'shields' },
      staticPreview: this.render(10),
      keywords: ['opencollective'],
    },
  ]

  static defaultBadgeData = {
    label: 'sponsors',
  }

  async handle({ collective }) {
    const data = await this.fetchCollectiveInfo({
      collective,
      accountType: ['ORGANIZATION'],
    })
    const backersCount = this.getCnt(data)
    return this.constructor.render(backersCount)
  }
}
