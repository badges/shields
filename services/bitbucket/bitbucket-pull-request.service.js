import Joi from 'joi'
import { AuthHelper } from '../../core/base-service/auth-helper.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger, optionalUrl } from '../validators.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  size: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

const errorMessages = {
  401: 'invalid credentials',
  403: 'private repo',
  404: 'not found',
}

function pullRequestClassGenerator(raw) {
  const routePrefix = raw ? 'pr-raw' : 'pr'
  const badgeSuffix = raw ? '' : ' open'

  return class BitbucketPullRequest extends BaseJsonService {
    static name = `BitbucketPullRequest${raw ? 'Raw' : ''}`
    static category = 'issue-tracking'
    static route = {
      base: `bitbucket/${routePrefix}`,
      pattern: `:user/:repo`,
      queryParamSchema,
    }

    static examples = [
      {
        title: 'Bitbucket open pull requests',
        namedParams: {
          user: 'atlassian',
          repo: 'python-bitbucket',
        },
        staticPreview: this.render({ prs: 22 }),
      },
      {
        title: 'Bitbucket Server open pull requests',
        namedParams: {
          user: 'foo',
          repo: 'bar',
        },
        queryParams: { server: 'https://bitbucket.mydomain.net' },
        staticPreview: this.render({ prs: 42 }),
      },
    ]

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
        config
      )
      this.bitbucketServerAuthHelper = new AuthHelper(
        {
          userKey: 'bitbucket_server_username',
          passKey: 'bitbucket_server_password',
          serviceKey: 'bitbucketServer',
        },
        config
      )
    }

    async fetchCloud({ user, repo }) {
      return this._requestJson(
        this.bitbucketAuthHelper.withBasicAuth({
          url: `https://bitbucket.org/api/2.0/repositories/${user}/${repo}/pullrequests/`,
          schema,
          options: { searchParams: { state: 'OPEN', limit: 0 } },
          errorMessages,
        })
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
          errorMessages,
        })
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
