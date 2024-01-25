import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import { description, httpErrorsFor } from './gitea-helper.js'
import GiteaBase from './gitea-base.js'

const schema = Joi.object({ 'x-total-count': nonNegativeInteger }).required()

const queryParamSchema = Joi.object({
  labels: Joi.string(),
  gitea_url: optionalUrl,
}).required()

export default class GiteaIssues extends GiteaBase {
  static category = 'issue-tracking'

  static route = {
    base: 'gitea/issues',
    pattern:
      ':variant(all|all-raw|open|open-raw|closed|closed-raw)/:user/:repo+',
    queryParamSchema,
  }

  static openApi = {
    '/gitea/issues/{variant}/{user}/{repo}': {
      get: {
        summary: 'Gitea Issues',
        description,
        parameters: [
          pathParam({
            name: 'variant',
            example: 'all',
            schema: { type: 'string', enum: this.getEnum('variant') },
          }),
          pathParam({
            name: 'user',
            example: 'gitea',
          }),
          pathParam({
            name: 'repo',
            example: 'tea',
          }),
          queryParam({
            name: 'gitea_url',
            example: 'https://gitea.com',
          }),
          queryParam({
            name: 'labels',
            example: 'test,failure::new',
            description:
              'If you want to use multiple labels, you can use a comma (<code>,</code>) to separate them, e.g. <code>foo,bar</code>',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'issues', color: 'informational' }

  static render({ variant, raw, labels, issueCount }) {
    const state = variant
    const isMultiLabel = labels && labels.includes(',')
    const labelText = labels ? `${isMultiLabel ? `${labels}` : labels} ` : ''

    let labelPrefix = ''
    let messageSuffix = ''
    if (raw) {
      labelPrefix = `${state} `
    } else {
      messageSuffix = state
    }
    return {
      label: `${labelPrefix}${labelText}issues`,
      message: `${metric(issueCount)}${
        messageSuffix ? ' ' : ''
      }${messageSuffix}`,
      color: issueCount > 0 ? 'yellow' : 'brightgreen',
    }
  }

  async handle(
    { variant, user, repo },
    { gitea_url: baseUrl = 'https://gitea.com', labels },
  ) {
    const { res } = await this._request(
      this.authHelper.withBearerAuthHeader({
        url: `${baseUrl}/api/v1/repos/${user}/${repo}/issues`,
        options: labels
          ? {
              searchParams: {
                page: '1',
                limit: '1',
                type: 'issues',
                state: variant.replace('-raw', ''),
                labels,
              },
            }
          : {
              searchParams: {
                page: '1',
                limit: '1',
                type: 'issues',
                state: variant.replace('-raw', ''),
              },
            },
        httpErrors: httpErrorsFor(),
      }),
    )
    const data = this.constructor._validate(res.headers, schema)
    // The total number of issues is in the `x-total-count` field in the headers.
    // https://gitea.com/api/swagger#/issue
    const issueCount = data['x-total-count']
    return this.constructor.render({
      variant: variant.split('-')[0],
      raw: variant.endsWith('-raw'),
      labels,
      issueCount,
    })
  }
}
