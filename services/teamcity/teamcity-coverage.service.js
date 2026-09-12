import Joi from 'joi'
import { coveragePercentage } from '../color-formatters.js'
import { optionalUrl } from '../validators.js'
import { InvalidResponse, pathParam, queryParam } from '../index.js'
import TeamCityBase from './teamcity-base.js'

const buildStatisticsSchema = Joi.object({
  property: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.string().required(),
      }),
    )
    .required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
  metric: Joi.string()
    .valid('statement', 'line', 'block', 'method', 'class', 'branch')
    .default('statement'),
}).required()

const METRIC_CODE = {
  statement: 'S',
  line: 'L',
  block: 'B',
  method: 'M',
  class: 'C',
  branch: 'R',
}

export default class TeamCityCoverage extends TeamCityBase {
  static category = 'coverage'

  static route = {
    base: 'teamcity/coverage',
    pattern: ':buildId',
    queryParamSchema,
  }

  static openApi = {
    '/teamcity/coverage/{buildId}': {
      get: {
        summary: 'TeamCity Coverage',
        parameters: [
          pathParam({ name: 'buildId', example: 'FileHelpersStable' }),
          queryParam({
            name: 'server',
            example: 'https://teamcity.jetbrains.com',
          }),
          queryParam({
            name: 'metric',
            example: 'statement',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'coverage',
  }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  transform({ data, metric }) {
    const code = METRIC_CODE[metric]
    const coveredKey = `CodeCoverageAbs${code}Covered`
    const totalKey = `CodeCoverageAbs${code}Total`
    let covered, total

    for (const p of data.property) {
      if (p.name === coveredKey) {
        covered = +p.value
      } else if (p.name === totalKey) {
        total = +p.value
      }

      if (covered !== undefined && total !== undefined) {
        const coverage = covered ? (covered / total) * 100 : 0
        return { coverage }
      }
    }

    throw new InvalidResponse({ prettyMessage: 'no coverage data available' })
  }

  async handle(
    { buildId },
    { server = 'https://teamcity.jetbrains.com', metric },
  ) {
    // JetBrains Docs: https://confluence.jetbrains.com/display/TCD18/REST+API#RESTAPI-Statistics
    const buildLocator = `buildType:(id:${buildId})`
    const apiPath = `app/rest/builds/${encodeURIComponent(
      buildLocator,
    )}/statistics`
    const data = await this.fetch({
      url: `${server}/${apiPath}`,
      schema: buildStatisticsSchema,
    })

    const { coverage } = this.transform({ data, metric })
    return this.constructor.render({ coverage })
  }
}
