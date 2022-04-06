import Joi from 'joi'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
import BaseGalaxyToolshedService from './galaxy-toolshed-base.js'

const repositoryRevisionInstallInfoSchema = Joi.array().items(
  Joi.object({
    create_time: Joi.string().required(),
  }).required(),
  Joi.object({}),
  Joi.object({})
)

export default class GalaxyToolshedReleaseDate extends BaseGalaxyToolshedService {
  static category = 'activity'
  static route = {
    base: 'galaxy-toolshed/release-date',
    pattern: ':repository/:owner',
  }

  static examples = [
    {
      title: 'Galaxy Toolshed - Release date',
      namedParams: {
        repository: 'sra_tools',
        owner: 'iuc',
      },
      staticPreview: this.render({
        releaseDate: new Date(0).setUTCSeconds(1538288239),
      }),
    },
  ]

  static defaultBadgeData = {
    label: 'release date',
  }

  static render({ releaseDate }) {
    return { message: formatDate(releaseDate), color: ageColor(releaseDate) }
  }

  async fetch({ repository, owner }) {}

  static transform({ response }) {
    const data = this.filterRepositoryRevisionInstallInfo({
      response,
    })
    return data.create_time
  }

  async handle({ repository, owner }) {
    const response = await this.fetchLastOrderedInstallableRevisionsSchema({
      repository,
      owner,
      schema: repositoryRevisionInstallInfoSchema,
    })
    const releaseDate = this.constructor.transform({ response })
    return this.constructor.render({ releaseDate })
  }
}
