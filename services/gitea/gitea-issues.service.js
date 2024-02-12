import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { fetchIssue } from './gitea-common-fetch.js'
import { description, httpErrorsFor, renderIssue } from './gitea-helper.js'
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
  async handle(
    { variant, user, repo },
    { gitea_url: baseUrl = 'https://gitea.com', labels },
  ) {
    const options = {
      searchParams: {
        page: '1',
        limit: '1',
        type: 'issues',
        state: variant.replace('-raw', ''),
      },
    }
    if (labels) {
      options.searchParams.labels = labels
    }

    const { res } = await fetchIssue(this, {
      user,
      repo,
      baseUrl,
      options,
      httpErrors: httpErrorsFor(),
    })

    const data = this.constructor._validate(res.headers, schema)
    // The total number of issues is in the `x-total-count` field in the headers.
    // Pull requests are an issue of type pulls
    // https://gitea.com/api/swagger#/issue
    const count = data['x-total-count']
    return renderIssue({
      variant,
      labels,
      defaultBadgeData: this.constructor.defaultBadgeData,
      count,
    })
  }
}
