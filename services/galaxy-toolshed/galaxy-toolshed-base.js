import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const orderedInstallableRevisionsSchema = Joi.array()
  .items(Joi.string())
  .required()

export default class BaseGalaxyToolshedService extends BaseJsonService {
  static defaultBadgeData = { label: 'galaxy-toolshed' }
  static baseUrl = 'https://toolshed.g2.bx.psu.edu'

  async fetchOrderedInstallableRevisionsSchema({ repositoryName, owner }) {
    return this._requestJson({
      schema: orderedInstallableRevisionsSchema,
      url: `${this.constructor.baseUrl}/api/repositories/get_ordered_installable_revisions?name=${repositoryName}&owner=${owner}`,
    })
  }

  async fetchRepositoryRevisionInstallInfoSchema({
    repositoryName,
    owner,
    schema,
    changesetRevision,
  }) {
    return this._requestJson({
      schema,
      url: `${this.constructor.baseUrl}/api/repositories/get_repository_revision_install_info?name=${repositoryName}&owner=${owner}&changeset_revision=${changesetRevision}`,
    })
  }

  async fetchLastOrderedInstallableRevisionsSchema({
    repositoryName,
    owner,
    schema,
  }) {
    const changesetRevisions =
      await this.fetchOrderedInstallableRevisionsSchema({
        repositoryName,
        owner,
      })
    return this.fetchRepositoryRevisionInstallInfoSchema({
      repositoryName,
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
