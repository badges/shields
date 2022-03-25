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
    schema,
    repositoryName,
    owner,
    changesetRevision,
  }) {
    return this._requestJson({
      schema,
      url: `${this.constructor.baseUrl}/api/repositories/get_repository_revision_install_info?name=${repositoryName}&owner=${owner}&changeset_revision=${changesetRevision}`,
    })
  }
}
