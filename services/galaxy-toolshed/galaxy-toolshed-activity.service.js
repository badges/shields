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

export default class GalaxyToolshedActivity extends BaseGalaxyToolshedService {
  static category = 'activity'
  static route = {
    base: 'galaxy-toolshed/create-date',
    pattern: ':repositoryName/:owner',
  }

  static examples = [
    {
      title: 'Galaxy Toolshed - Create Time',
      namedParams: {
        repositoryName: 'sra_tools',
        owner: 'iuc',
      },
      staticPreview: this.render({
        createDate: new Date(0).setUTCSeconds(1538288239),
      }),
    },
  ]

  static defaultBadgeData = {
    label: 'create date',
  }

  static render({ createDate }) {
    return { message: formatDate(createDate), color: ageColor(createDate) }
  }

  async fetch({ repositoryName, owner }) {
    const changesetRevisions =
      await this.fetchOrderedInstallableRevisionsSchema({
        repositoryName,
        owner,
      })
    return this.fetchRepositoryRevisionInstallInfoSchema({
      schema: repositoryRevisionInstallInfoSchema,
      repositoryName,
      owner,
      changesetRevision: changesetRevisions.shift(),
    })
  }

  static transform(response) {
    const metadata = response
      .filter(function (x) {
        return Object.keys(x).length > 0
      })
      .shift()
    return metadata.create_time
  }

  async handle({ repositoryName, owner }) {
    const response = await this.fetch({ repositoryName, owner })
    const createDate = this.constructor.transform(response)
    return this.constructor.render({ createDate })
  }
}
