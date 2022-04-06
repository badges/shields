import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import BaseGalaxyToolshedService from './galaxy-toolshed-base.js'

const repositoryRevisionInstallInfoSchema = Joi.array().items(
  Joi.object({
    times_downloaded: Joi.number().required(),
  }).required(),
  Joi.object({}),
  Joi.object({})
)

export default class GalaxyToolshedDownloads extends BaseGalaxyToolshedService {
  static category = 'downloads'
  static route = {
    base: 'galaxy-toolshed/downloads',
    pattern: ':repository/:owner',
  }

  static examples = [
    {
      title: 'Galaxy Toolshed - Downloads',
      namedParams: {
        repository: 'sra_tools',
        owner: 'iuc',
      },
      staticPreview: this.render({ downloads: 10000 }),
    },
  ]

  static defaultBadgeData = {
    label: 'downloads',
  }

  static render({ downloads }) {
    return renderDownloadsBadge({ downloads })
  }

  static transform(response) {
    const data = this.filterRepositoryRevisionInstallInfo({
      response,
    })
    return data.times_downloaded
  }

  async handle({ repository, owner }) {
    const response = await this.fetchLastOrderedInstallableRevisionsSchema({
      repository,
      owner,
      schema: repositoryRevisionInstallInfoSchema,
    })
    const downloads = this.constructor.transform(response)
    return this.constructor.render({ downloads })
  }
}
