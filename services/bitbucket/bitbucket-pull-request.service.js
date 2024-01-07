import Joi from 'joi'
import { AuthHelper } from '../../core/base-service/auth-helper.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger, optionalUrl } from '../validators.js'
import { BaseJsonService, pathParam, queryParam } from '../index.js'

const schema = Joi.object({
  size: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

const httpErrors = {
  401: 'invalid credentials',
  403: 'private repo',
  404: 'not found',
}

function pullRequestClassGenerator(raw) {
  const routePrefix = raw ? 'pr-raw' : 'pr'
  const badgeSuffix = raw ? '' : ' open'
  const titleSuffix = raw ? ' (raw)' : ''

  return class BitbucketPullRequest extends BaseJsonService {
    static name = `BitbucketPullRequest${raw ? 'Raw' : ''}`
    static category = 'issue-tracking'
    static route = {
      base: `bitbucket/${routePrefix}`,
      pattern: ':user/:repo',
      queryParamSchema,
    }

    static get openApi() {
      const key = `/bitbucket/${routePrefix}/{user}/{repo}`
      const route = {}
      route[key] = {
        get: {
          summary: `Bitbucket open pull requests ${titleSuffix}`,
          parameters: [
            pathParam({
              name: 'user',
              example: 'shields-io',
            }),
            pathParam({
              name: 'repo',
              example: 'test-repo',
            }),
            queryParam({
              name: 'server',
              example: 'https://bitbucket.mydomain.net',
              description:
                'When not specified, this will default to `https://bitbucket.org`.',
            }),
          ],
        },
      }
      return route
    }

    static defaultBadgeData = { label: 'pull requests' }

    static render({ prs }) {
      return {
        message: `${metric(prs)}${badgeSuffix}`,
        color: prs ? 'yellow' : 'brightgreen',
      }
    }

    constructor(context, config) {
      super(context, config)

      this.bitbucketAuthHelper = new AuthHelper(
        {
          userKey: 'bitbucket_username',
          passKey: 'bitbucket_password',
          authorizedOrigins: ['https://bitbucket.org'],
        },
        config,
      )
      this.bitbucketServerAuthHelper = new AuthHelper(
        {
          userKey: 'bitbucket_server_username',
          passKey: 'bitbucket_server_password',
          serviceKey: 'bitbucketServer',
        },
        config,
      )
    }

    async fetchCloud({ user, repo }) {
      return this._requestJson(
        this.bitbucketAuthHelper.withBasicAuth({
          url: `https://bitbucket.org/api/2.0/repositories/${user}/${repo}/pullrequests/`,
          schema,
          options: { searchParams: { state: 'OPEN', limit: 0 } },
          httpErrors,
        }),
      )
    }

    // https://docs.atlassian.com/bitbucket-server/rest/5.16.0/bitbucket-rest.html#idm46229602363312
    async fetchServer({ server, user, repo }) {
      return this._requestJson(
        this.bitbucketServerAuthHelper.withBasicAuth({
          url: `${server}/rest/api/1.0/projects/${user}/repos/${repo}/pull-requests`,
          schema,
          options: {
            searchParams: {
              state: 'OPEN',
              limit: 100,
              withProperties: false,
              withAttributes: false,
            },
          },
          httpErrors,
        }),
      )
    }

    async fetch({ server, user, repo }) {
      if (server !== undefined) {
        return this.fetchServer({ server, user, repo })
      } else {
        return this.fetchCloud({ user, repo })
      }
    }

    async handle({ user, repo }, { server }) {
      const data = await this.fetch({ server, user, repo })
      return this.constructor.render({ prs: data.size })
    }
  }
}

export const BitbucketRawPullRequests = pullRequestClassGenerator(true)
export const BitbucketNonRawPullRequests = pullRequestClassGenerator(false)
