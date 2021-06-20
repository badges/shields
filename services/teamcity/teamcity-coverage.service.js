import Joi from 'joi'
import { coveragePercentage } from '../color-formatters.js'
import { optionalUrl } from '../validators.js'
import { InvalidResponse } from '../index.js'
import TeamCityBase from './teamcity-base.js'

const buildStatisticsSchema = Joi.object({
  property: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.string().required(),
      })
    )
    .required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

export default class TeamCityCoverage extends TeamCityBase {
  static category = 'coverage'

  static route = {
    base: 'teamcity/coverage',
    pattern: ':buildId',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'TeamCity Coverage',
      namedParams: {
        buildId: 'ReactJSNet_PullRequests',
      },
      queryParams: {
        server: 'https://teamcity.jetbrains.com',
      },
      staticPreview: this.render({
        coverage: 82,
      }),
    },
  ]

  static defaultBadgeData = {
    label: 'coverage',
  }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  transform({ data }) {
    let covered, total

    for (const p of data.property) {
      if (p.name === 'CodeCoverageAbsSCovered') {
        covered = +p.value
      } else if (p.name === 'CodeCoverageAbsSTotal') {
        total = +p.value
      }

      if (covered !== undefined && total !== undefined) {
        const coverage = covered ? (covered / total) * 100 : 0
        return { coverage }
      }
    }

    throw new InvalidResponse({ prettyMessage: 'no coverage data available' })
  }

  async handle({ buildId }, { server = 'https://teamcity.jetbrains.com' }) {
    // JetBrains Docs: https://confluence.jetbrains.com/display/TCD18/REST+API#RESTAPI-Statistics
    const buildLocator = `buildType:(id:${buildId})`
    const apiPath = `app/rest/builds/${encodeURIComponent(
      buildLocator
    )}/statistics`
    const data = await this.fetch({
      url: `${server}/${apiPath}`,
      schema: buildStatisticsSchema,
    })

    const { coverage } = this.transform({ data })
    return this.constructor.render({ coverage })
  }
}
