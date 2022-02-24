import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const orderedInstallableRevisionsSchema = Joi.array()
  .items(Joi.string())
  .required()
const repositoryRevisionInstallInfoSchema = Joi.array().items(
  Joi.object({}),
  Joi.object({
    valid_tools: Joi.array()
      .items(
        Joi.object({
          requirements: Joi.array()
            .items(
              Joi.object({
                name: Joi.string().required(),
                version: Joi.string().required(),
              }).required()
            )
            .required(),
          id: Joi.string().required(),
          name: Joi.string().required(),
          version: Joi.string().required(),
        }).required()
      )
      .required(),
  }).required(),
  Joi.object({})
)

export default class BaseGalaxyToolshedService extends BaseJsonService {
  static defaultBadgeData = { label: 'galaxy-toolshed' }
  static baseUrl = 'https://toolshed.g2.bx.psu.edu'

  async fetchOrderedInstallableRevisionsSchema({ reponame, owner }) {
    return this._requestJson({
      schema: orderedInstallableRevisionsSchema,
      url: `${this.constructor.baseUrl}/api/repositories/get_ordered_installable_revisions?name=${reponame}&owner=${owner}`,
    })
  }

  async fetchRepositoryRevisionInstallInfoSchema({
    reponame,
    owner,
    changesetRevision,
  }) {
    return this._requestJson({
      schema: repositoryRevisionInstallInfoSchema,
      url: `${this.constructor.baseUrl}/api/repositories/get_repository_revision_install_info?name=${reponame}&owner=${owner}&changeset_revision=${changesetRevision}`,
    })
  }
}
