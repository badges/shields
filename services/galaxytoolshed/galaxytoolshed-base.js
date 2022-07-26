import Joi from 'joi'
import { nonNegativeInteger, semver } from '../validators.js'
import { NotFound, BaseJsonService } from '../index.js'

const orderedInstallableRevisionsSchema = Joi.array()
  .items(Joi.string())
  .required()

const repositoryRevisionInstallInfoSchema = Joi.array()
  .ordered(
    Joi.object({
      create_time: Joi.date().required(),
      times_downloaded: nonNegativeInteger,
    }).required(),
    Joi.object({
      changeset_revision: Joi.string().required(),
      valid_tools: Joi.array()
        .ordered(
          Joi.object({
            requirements: Joi.array()
              .ordered(
                Joi.object({
                  name: Joi.string().required(),
                  version: semver,
                }).required()
              )
              .items(Joi.any()),
            id: Joi.string().required(),
            name: Joi.string().required(),
            version: semver,
          }).required()
        )
        .items(Joi.any()),
    }).required()
  )
  .items(Joi.any())

export default class BaseGalaxyToolshedService extends BaseJsonService {
  static defaultBadgeData = { label: 'galaxytoolshed' }
  static baseUrl = 'https://toolshed.g2.bx.psu.edu'

  async fetchOrderedInstallableRevisionsSchema({ repository, owner }) {
    return this._requestJson({
      schema: orderedInstallableRevisionsSchema,
      url: `${this.constructor.baseUrl}/api/repositories/get_ordered_installable_revisions?name=${repository}&owner=${owner}`,
    })
  }

  async fetchRepositoryRevisionInstallInfoSchema({
    repository,
    owner,
    changesetRevision,
  }) {
    return this._requestJson({
      schema: repositoryRevisionInstallInfoSchema,
      url: `${this.constructor.baseUrl}/api/repositories/get_repository_revision_install_info?name=${repository}&owner=${owner}&changeset_revision=${changesetRevision}`,
    })
  }

  async fetchLastOrderedInstallableRevisionsSchema({ repository, owner }) {
    const changesetRevisions =
      await this.fetchOrderedInstallableRevisionsSchema({
        repository,
        owner,
      })
    if (!Array.isArray(changesetRevisions) || !changesetRevisions.length) {
      throw new NotFound({ prettyMessage: 'changesetRevision not found' })
    }
    return this.fetchRepositoryRevisionInstallInfoSchema({
      repository,
      owner,
      changesetRevision: changesetRevisions[0],
    })
  }
}
