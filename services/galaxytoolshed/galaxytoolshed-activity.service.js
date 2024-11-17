import { pathParams } from '../index.js'
import { renderDateBadge } from '../date.js'
import BaseGalaxyToolshedService from './galaxytoolshed-base.js'

export default class GalaxyToolshedCreatedDate extends BaseGalaxyToolshedService {
  static category = 'activity'
  static route = {
    base: 'galaxytoolshed/created-date',
    pattern: ':repository/:owner',
  }

  static openApi = {
    '/galaxytoolshed/created-date/{repository}/{owner}': {
      get: {
        summary: 'Galaxy Toolshed - Created Date',
        parameters: pathParams(
          {
            name: 'repository',
            example: 'sra_tools',
          },
          {
            name: 'owner',
            example: 'iuc',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'created date',
  }

  async handle({ repository, owner }) {
    const response = await this.fetchLastOrderedInstallableRevisionsSchema({
      repository,
      owner,
    })
    const { create_time: date } = response[0]
    return renderDateBadge(date, true)
  }
}
