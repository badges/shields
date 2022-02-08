import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  badge: Joi.object({
    status: Joi.string().required(),
    duration: Joi.string().required(),
    total_tests: Joi.string().required(),
  }),
}).required()

export default class TasBuildStatus extends BaseJsonService {
  static category = 'build'

  static route = {
    base: 'tas/build',
    pattern: ':provider/:org/:repo',
  }

  static examples = [
    {
      title: 'TAS Build',
      namedParams: { provider: 'github', org: 'lambdatest', repo: 'synapse' },
      staticPreview: this.render({
        testExecuted: '54',
        duration: '2m',
        status: 'passing',
      }),
    },
  ]

  static defaultBadgeData = { label: 'TAS' }

  static render({ testExecuted, duration, status }) {
    const message = `${testExecuted} tests | Executed in ${duration}`
    const color = status === 'passed' ? 'brightgreen' : 'red'
    return {
      message,
      color,
    }
  }

  async fetch({ provider, org, repo }) {
    return this._requestJson({
      schema,
      url: `https://stage-api.tas.lambdatest.com/repo/badge?git_provider=${provider}&org=${org}&repo=${repo}`,
      errorMessages: {
        401: 'private application not supported',
        404: 'application not found',
      },
    })
  }

  async handle({ provider, org, repo }) {
    const { badge } = await this.fetch({ provider, org, repo })
    const status = badge.status
    const testExecuted = badge.total_tests
    const duration = badge.duration
    return this.constructor.render({ testExecuted, duration, status })
  }
}
