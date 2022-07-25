import { formatDate } from '../text-formatters.js'
import BaseGalaxyToolshedService from './galaxytoolshed-base.js'

export default class GalaxyToolshedCreatedDate extends BaseGalaxyToolshedService {
  static category = 'activity'
  static route = {
    base: 'galaxytoolshed/created-date',
    pattern: ':repository/:owner',
  }

  static examples = [
    {
      title: 'Galaxy Toolshed (created date)',
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
    label: 'created date',
    color: 'blue',
  }

  static render({ date }) {
    return { message: formatDate(date) }
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
