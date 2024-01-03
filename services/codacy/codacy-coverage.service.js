import Joi from 'joi'
import { coveragePercentage as coveragePercentageColor } from '../color-formatters.js'
import { BaseSvgScrapingService, NotFound, pathParams } from '../index.js'

const schema = Joi.object({
  message: Joi.alternatives()
    .try(Joi.string().regex(/^[0-9]+%$/), Joi.equal('!'))
    .required(),
}).required()

export default class CodacyCoverage extends BaseSvgScrapingService {
  static category = 'coverage'
  static route = { base: 'codacy/coverage', pattern: ':projectId/:branch*' }

  static openApi = {
    '/codacy/coverage/{projectId}': {
      get: {
        summary: 'Codacy coverage',
        parameters: pathParams({
          name: 'projectId',
          example: 'd5402a91aa7b4234bd1c19b5e86a63be',
        }),
      },
    },
    '/codacy/coverage/{projectId}/{branch}': {
      get: {
        summary: 'Codacy coverage (branch)',
        parameters: pathParams(
          {
            name: 'projectId',
            example: 'd5402a91aa7b4234bd1c19b5e86a63be',
          },
          {
            name: 'branch',
            example: 'master',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'coverage' }

  static render({ percentage }) {
    return {
      message: `${percentage}%`,
      color: coveragePercentageColor(percentage),
    }
  }

  static transform({ coverageString }) {
    return {
      percentage: parseFloat(coverageString.replace(/%$/, '')),
    }
  }

  async handle({ projectId, branch }) {
    const { message: coverageString } = await this._requestSvg({
      schema,
      url: `https://api.codacy.com/project/badge/coverage/${encodeURIComponent(
        projectId,
      )}`,
      options: { searchParams: { branch } },
      valueMatcher: /text-anchor="middle">([^<>]+)<\/text>/,
      httpErrors: {
        404: 'project not found',
      },
    })

    // When sending an invalid branch, Codacy ignores the branch, failing
    // silently, so we can't provide an error message for this case.

    if (coverageString === '!') {
      throw new NotFound({
        prettyMessage: 'not enabled for this project',
      })
    }

    const { percentage } = this.constructor.transform({ coverageString })
    return this.constructor.render({ percentage })
  }
}
