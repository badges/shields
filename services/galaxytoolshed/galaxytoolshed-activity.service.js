import { age } from '../color-formatters.js'
import { formatDate } from '../text-formatters.js'
import BaseGalaxyToolshedService from './galaxytoolshed-base.js'

export default class GalaxyToolshedReleaseDate extends BaseGalaxyToolshedService {
  static category = 'activity'
  static route = {
    base: 'galaxytoolshed/release-date',
    pattern: ':repository/:owner',
  }

  static examples = [
    {
      title: 'Galaxy Toolshed (create time)',
      namedParams: {
        repository: 'sra_tools',
        owner: 'iuc',
      },
      staticPreview: this.render({
        date: this.render({ date: '2022-01-01' }),
      }),
    },
  ]

  static defaultBadgeData = {
    label: 'release date',
  }

  static render({ date }) {
    return { message: formatDate(date), color: age(date) }
  }

  async handle({ repository, owner }) {
    const response = await this.fetchLastOrderedInstallableRevisionsSchema({
      repository,
      owner,
    })
    const { create_time: date } = response[0]
    return this.constructor.render({ date })
  }
}
