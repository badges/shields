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
    pattern: ':repositoryName/:owner',
  }

  static examples = [
    {
      title: 'Galaxy Toolshed - Downloads',
      namedParams: {
        repositoryName: 'sra_tools',
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
    const metadata = response
      .filter(function (x) {
        return Object.keys(x).length > 0
      })
      .shift()
    return metadata.times_downloaded
  }

  async handle({ repositoryName, owner }) {
    const response = await this.fetchLastOrderedInstallableRevisionsSchema({
      repositoryName,
      owner,
      schema: repositoryRevisionInstallInfoSchema,
    })
    const downloads = this.constructor.transform(response)
    return this.constructor.render({ downloads })
  }
}
