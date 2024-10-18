import { renderDownloadsBadge } from '../downloads.js'
import { pathParams } from '../index.js'
import { BaseCratesUserService, description } from './crates-base.js'

export default class CratesUserDownloads extends BaseCratesUserService {
  static category = 'downloads'
  static route = {
    base: 'crates',
    pattern: 'udt/:userId',
  }

  static openApi = {
    '/crates/udt/{userId}': {
      get: {
        summary: 'Crates.io User Total Downloads',
        description,
        parameters: pathParams({
          name: 'userId',
          example: '3027',
          description:
            'The user ID can be found using `https://crates.io/api/v1/users/{username}`',
        }),
      },
    },
  }

  async handle({ userId }) {
    const json = await this.fetch({ userId })
    const { total_downloads: downloads } = json
    return renderDownloadsBadge({ downloads, labelOverride: 'downloads' })
  }
}
