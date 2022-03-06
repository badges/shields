import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  Score: Joi.required(),
}).required()

export default class ScorecardScore extends BaseJsonService {
  static category = 'version'

  static route = { base: 'scorecard', pattern: ':host/:orgName/:repoName' }

  async fetch({ host, orgName, repoName }) {
    return this._requestJson({
      schema,
      url: `https://api.securityscorecards.dev/projects/${host}/${orgName}/${repoName}.json`,
    })
  }

  async handle({ host, orgName, repoName }) {
    const { Score } = await this.fetch({ host, orgName, repoName })

    return {
      label: 'scorecard-score',
      message: Score,
      color: 'blue',
    }
  }
}
