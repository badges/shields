import OpencollectiveBase from './opencollective-base.js'

export default class OpencollectiveBackers extends OpencollectiveBase {
  static route = this.buildRoute('backers')

  static examples = [
    {
      title: 'Open Collective backers',
      namedParams: { collective: 'shields' },
      staticPreview: this.render(25),
      keywords: ['opencollective'],
    },
  ]

  static _cacheLength = 900

  static defaultBadgeData = {
    label: 'backers',
  }

  async handle({ collective }) {
    const data = await this.fetchCollectiveInfo({
      collective,
      accountType: ['INDIVIDUAL'],
    })
    const backersCount = this.getCount(data)

    return this.constructor.render(backersCount)
  }
}
