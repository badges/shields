import Joi from 'joi'
import { BaseJsonService } from '../index.js'

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

export default class LgtmBaseService extends BaseJsonService {
  static category = 'analysis'

  static defaultBadgeData = { label: 'lgtm' }

  static pattern = `:host(${Object.keys(hostMappings).join('|')})/:user/:repo`

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
