'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  alerts: Joi.number().required(),

  languages: Joi.array()
    .items(
      Joi.object({
        lang: Joi.string().required(),
        grade: Joi.string(),
      })
    )
    .required(),
}).required()

const hostMappings = {
  github: 'g',
  bitbucket: 'b',
  gitlab: 'gl',
}

module.exports = class LgtmBaseService extends BaseJsonService {
  static get category() {
    return 'analysis'
  }

  static get defaultBadgeData() {
    return { label: 'lgtm' }
  }

  static get pattern() {
    return `:host(${Object.keys(hostMappings).join('|')})/:user/:repo`
  }

  async fetch({ host, user, repo }) {
    const mappedHost = hostMappings[host]
    const url = `https://lgtm.com/api/v0.1/project/${mappedHost}/${user}/${repo}/details`

    return this._requestJson({
      schema,
      url,
      errorMessages: {
        404: 'project not found',
      },
    })
  }
}
