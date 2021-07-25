import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const condaSchema = Joi.object({
  latest_version: Joi.string().required(),
  conda_platforms: Joi.array().items(Joi.string()).required(),
  files: Joi.array()
    .items(
      Joi.object({
        ndownloads: nonNegativeInteger,
      })
    )
    .required(),
}).required()

export default class BaseCondaService extends BaseJsonService {
  static defaultBadgeData = { label: 'conda' }

  async fetch({ channel, pkg }) {
    return this._requestJson({
      schema: condaSchema,
      url: `https://api.anaconda.org/package/${channel}/${pkg}`,
    })
  }
}
