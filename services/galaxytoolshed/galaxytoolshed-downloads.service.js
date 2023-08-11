import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import BaseGalaxyToolshedService from './galaxytoolshed-base.js'

export default class GalaxyToolshedDownloads extends BaseGalaxyToolshedService {
  static category = 'downloads'
  static route = {
    base: 'galaxytoolshed/downloads',
    pattern: ':repository/:owner',
  }

  static openApi = {
    '/galaxytoolshed/downloads/{repository}/{owner}': {
      get: {
        summary: 'Galaxy Toolshed - Downloads',
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
    label: 'downloads',
  }

  async handle({ repository, owner }) {
    const response = await this.fetchLastOrderedInstallableRevisionsSchema({
      repository,
      owner,
    })
    const { times_downloaded: downloads } = response[0]
    return renderDownloadsBadge({ downloads })
  }
}
