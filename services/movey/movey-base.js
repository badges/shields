import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const keywords = []

const schema = Joi.object({
  package_name: Joi.string().required(),
  total_download_counts: nonNegativeInteger,
  latest_version: Joi.string().required(),
  versions: Joi.array()
    .items(
      Joi.object({
        version: Joi.string().required(),
        download_counts: nonNegativeInteger,
      })
    )
    .min(1)
    .required(),
}).required()

class BaseMoveyService extends BaseJsonService {
  static defaultBadgeData = { label: 'Movey.Net' }

  async fetch({ moveyPackage }) {
    const url = `https://www.movey.net/api/v1/packages/${moveyPackage}/badge`
    return this._requestJson({
      schema,
      url,
      errorMessages: {
        404: 'package not found',
      },
    })
  }
}

export { BaseMoveyService, keywords }
