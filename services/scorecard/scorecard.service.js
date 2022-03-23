import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  score: Joi.required(),
}).required()

export default class ScorecardScore extends BaseJsonService {
  static category = 'version'

  static route = { base: 'scorecard', pattern: ':host/:orgName/:repoName' }

  async fetch({ host, orgName, repoName }) {
    return this._requestJson({
      schema,
      url: `https://api.securityscorecards.dev/projects/${host}/${orgName}/${repoName}`,
    })
  }

  async handle({ host, orgName, repoName }) {
    const { score } = await this.fetch({ host, orgName, repoName })

    let clr = ''

    if (score <= 3) {
      clr = 'red'
    } else if (score <= 5) {
      clr = 'orange'
    } else if (score <= 7) {
      clr = 'yellow'
    } else {
      clr = 'green'
    }

    return {
      label: 'scorecard score',
      message: score,
      color: clr,
    }
  }
}
