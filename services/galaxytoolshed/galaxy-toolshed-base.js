import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const orderedInstallableRevisionsSchema = Joi.array()
  .items(Joi.string())
  .required()

export default class BaseGalaxyToolshedService extends BaseJsonService {
  static defaultBadgeData = { label: 'galaxy-toolshed' }
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
    schema,
    changesetRevision,
  }) {
    return this._requestJson({
      schema,
      url: `${this.constructor.baseUrl}/api/repositories/get_repository_revision_install_info?name=${repository}&owner=${owner}&changeset_revision=${changesetRevision}`,
    })
  }

  async fetchLastOrderedInstallableRevisionsSchema({
    repository,
    owner,
    schema,
  }) {
    const changesetRevisions =
      await this.fetchOrderedInstallableRevisionsSchema({
        repository,
        owner,
      })
    return this.fetchRepositoryRevisionInstallInfoSchema({
      repository,
      owner,
      schema,
      changesetRevision: changesetRevisions.shift(),
    })
  }

  static filterRepositoryRevisionInstallInfo({ response }) {
    return response
      .filter(function (x) {
        return Object.keys(x).length > 0
      })
      .shift()
  }
}
