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

  static defaultBadgeData = {
    label: 'backers',
  }

  async handle({ collective }) {
    const { backersCount } = await this.fetchCollectiveBackersCount(
      collective,
      { userType: 'users' }
    )
    return this.constructor.render(backersCount)
  }
}
