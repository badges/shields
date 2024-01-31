import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { description, httpErrorsFor, renderIssue } from './gitea-helper.js'
import GiteaBase from './gitea-base.js'

const schema = Joi.object({ 'x-total-count': nonNegativeInteger }).required()

const queryParamSchema = Joi.object({
  labels: Joi.string(),
  gitea_url: optionalUrl,
}).required()

export default class GiteaPullRequests extends GiteaBase {
  static category = 'issue-tracking'

  static route = {
    base: 'gitea/pull-requests',
    pattern:
      ':variant(all|all-raw|open|open-raw|closed|closed-raw)/:user/:repo+',
    queryParamSchema,
  }

  static openApi = {
    '/gitea/pull-requests/{variant}/{user}/{repo}': {
      get: {
        summary: 'Gitea Pull Requests',
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

  static defaultBadgeData = { label: 'pull requests', color: 'informational' }

  async handle(
    { variant, user, repo },
    { gitea_url: baseUrl = 'https://gitea.com', labels },
  ) {
    const options = {
      searchParams: {
        page: '1',
        limit: '1',
        type: 'pulls',
        state: variant.replace('-raw', ''),
      },
    }
    if (labels) {
      options.searchParams.labels = labels
    }

    const { res } = await this._request(
      this.authHelper.withBearerAuthHeader({
        url: `${baseUrl}/api/v1/repos/${user}/${repo}/issues`,
        options,
        httpErrors: httpErrorsFor(),
      }),
    )
    const data = this.constructor._validate(res.headers, schema)
    // The total number of issues is in the `x-total-count` field in the headers.
    // Pull requests are an issue of type pulls
    // https://gitea.com/api/swagger#/issue
    const count = data['x-total-count']
    return renderIssue({
      variant: variant.split('-')[0],
      raw: variant.endsWith('-raw'),
      labels,
      defaultBadgeData: this.constructor.defaultBadgeData,
      count,
    })
  }
}
