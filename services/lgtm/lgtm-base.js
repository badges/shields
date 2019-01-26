'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  alerts: Joi.number().required(),

  languages: Joi.array()
    .min(1)
    .required(),
}).required()

module.exports = class LgtmBaseService extends BaseJsonService {
  static get defaultBadgeData() {
    return { label: 'lgtm' }
  }

  async fetch({ user, repo }) {
    const url = `https://lgtm.com/api/v0.1/project/g/${user}/${repo}/details`

    return this._requestJson({ schema, url })
  }

  static get category() {
    return 'analysis'
  }
}
