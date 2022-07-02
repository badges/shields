import { renderDownloadsBadge } from '../downloads.js'
import BaseGalaxyToolshedService from './galaxytoolshed-base.js'

export default class GalaxyToolshedDownloads extends BaseGalaxyToolshedService {
  static category = 'downloads'
  static route = {
    base: 'galaxytoolshed/downloads',
    pattern: ':repository/:owner',
  }

  static examples = [
    {
      title: 'Galaxy Toolshed - Downloads',
      namedParams: {
        repository: 'sra_tools',
        owner: 'iuc',
      },
      staticPreview: renderDownloadsBadge({ downloads: 10000 }),
    },
  ]

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
