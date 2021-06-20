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
      namedParams: { projectId: '59d607d0e311408885e418004068ea58' },
      staticPreview: this.render({ percentage: 90 }),
    },
    {
      title: 'Codacy branch coverage',
      pattern: ':projectId/:branch',
      namedParams: {
        projectId: '59d607d0e311408885e418004068ea58',
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
      options: { qs: { branch } },
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
