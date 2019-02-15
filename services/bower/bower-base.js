'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')

const schema = Joi.object()
  .keys({
    normalized_licenses: Joi.array()
      .items(
        // normalized_license may be [] if the package does not declare a license
        Joi.string()
      )
      .required(),

    // latest_stable_release can be object or NULL
    latest_stable_release: Joi.object()
      .keys({
        name: Joi.string().required(),
      })
      .allow(null),

    // latest_release_number can be NULL for bower because bower
    // has no registry to enforce any release exists
    latest_release_number: Joi.string().allow(null),
  })
  .required()

module.exports = class BaseBowerService extends BaseJsonService {
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
