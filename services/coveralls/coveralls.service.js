import Joi from 'joi'
import { coveragePercentage } from '../color-formatters.js'
import { BaseJsonService, pathParam, queryParam } from '../index.js'

const schema = Joi.object({
  covered_percent: Joi.number().min(0).max(100).required(),
}).required()

const queryParamSchema = Joi.object({
  branch: Joi.string(),
}).required()

export default class Coveralls extends BaseJsonService {
  static category = 'coverage'
  static route = {
    base: 'coverallsCoverage',
    pattern: ':vcsType(github|bitbucket|gitlab)/:user/:repo+',
    queryParamSchema,
  }

  static openApi = {
    '/coverallsCoverage/{vcsType}/{user}/{repo}': {
      get: {
        summary: 'Coveralls',
        parameters: [
          pathParam({
            name: 'vcsType',
            example: 'github',
            schema: { type: 'string', enum: this.getEnum('vcsType') },
          }),
          pathParam({ name: 'user', example: 'jekyll' }),
          pathParam({ name: 'repo', example: 'jekyll' }),
          queryParam({ name: 'branch', example: 'master' }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'coverage' }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  async fetch({ vcsType, user, repo, branch }) {
    // https://docs.coveralls.io/api-introduction#getting-data-from-coveralls
    const url = `https://coveralls.io/${
      vcsType || 'github'
    }/${user}/${repo}.json`
    const options = {
      searchParams: {
        // The API returns the latest result (across any branch) if no branch is explicitly specified,
        // whereas the Coveralls native badge (and the Shields.io badges for Coveralls) show
        // the coverage for the default branch if no branch is explicitly specified. If the user
        // doesn't specify their desired badge, then we can get the Coverage for the latest branch
        // from the API by specifying an invalid branch name in which case the API returns the coverage
        // for the default branch. This ensures we show the same percentage value.
        branch: branch || '@',
      },
    }

    return this._requestJson({
      schema,
      url,
      options,
      httpErrors: {
        404: 'repository not found',
      },
    })
  }

  async handle({ vcsType, user, repo }, { branch }) {
    const json = await this.fetch({ vcsType, user, repo, branch })
    return this.constructor.render({ coverage: json.covered_percent })
  }
}
