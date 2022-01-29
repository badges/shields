import Joi from 'joi'
import { coveragePercentage as coveragePercentageColor } from '../color-formatters.js'
import { BaseSvgScrapingService, NotFound } from '../index.js'

const schema = Joi.object({
  message: Joi.alternatives()
    .try(Joi.string().regex(/^[0-9]+%$/), Joi.equal('!'))
    .required(),
}).required()

export default class CodacyCoverage extends BaseSvgScrapingService {
  static category = 'coverage'
  static route = { base: 'codacy/coverage', pattern: ':projectId/:branch*' }

  static examples = [
    {
      title: 'Codacy coverage',
      pattern: ':projectId',
      namedParams: { projectId: 'd5402a91aa7b4234bd1c19b5e86a63be' },
      staticPreview: this.render({ percentage: 90 }),
    },
    {
      title: 'Codacy branch coverage',
      pattern: ':projectId/:branch',
      namedParams: {
        projectId: 'd5402a91aa7b4234bd1c19b5e86a63be',
        branch: 'master',
      },
      staticPreview: this.render({ percentage: 90 }),
    },
  ]

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
        projectId
      )}`,
      options: { searchParams: { branch } },
      valueMatcher: /text-anchor="middle">([^<>]+)<\/text>/,
      errorMessages: {
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
