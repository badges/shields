import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object()
  .keys({
    normalized_licenses: Joi.array()
      .items(
        // normalized_license may be [] if the package does not declare a license
        Joi.string()
      )
      .required(),

    // Keys can be NULL for bower because bower
    // has no registry to enforce any release exists
    latest_release_number: Joi.string().allow(null),
    latest_stable_release_number: Joi.string().allow(null),
  })
  .required()

export default class BaseBowerService extends BaseJsonService {
  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://libraries.io/api/bower/${packageName}`,
      errorMessages: {
        404: 'package not found',
      },
    })
  }
}
