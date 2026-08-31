import Joi from 'joi'
import { queryParam } from '../index.js'
import { coveragePercentage } from '../color-formatters.js'
import JenkinsBase from './jenkins-base.js'
import {
  buildTreeParamQueryString,
  buildUrl,
  queryParamSchema,
} from './jenkins-common.js'

const schemaCoverage = Joi.object({
  projectStatistics: Joi.object({
    line: Joi.string()
      .pattern(/\d+\.\d+%/)
      .required(),
  }).required(),
}).required()

const description =
  'We support coverage metrics from the <a href="https://github.com/jenkinsci/coverage-plugin">Jenkins Coverage Plugin</a>.'

export default class JenkinsCoverage extends JenkinsBase {
  static category = 'coverage'

  static route = {
    base: 'jenkins/coverage',
    pattern: '',
    queryParamSchema,
  }

  static openApi = {
    '/jenkins/coverage': {
      get: {
        summary: 'Jenkins Coverage',
        description,
        parameters: [
          queryParam({
            name: 'jobUrl',
            example: 'https://jenkins.mm12.xyz/jenkins/job/nmfu/job/master',
            required: true,
          }),
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

  async handle(_routeParams, { jobUrl }) {
    const json = await this.fetch({
      url: buildUrl({ jobUrl, plugin: 'coverage' }),
      schema: schemaCoverage,
      searchParams: buildTreeParamQueryString('projectStatistics[line]'),
      httpErrors: {
        404: 'job or coverage not found',
      },
    })
    const lineCoverageStr = json.projectStatistics.line
    const lineCoverage = lineCoverageStr.substring(
      0,
      lineCoverageStr.length - 1,
    )

    return this.constructor.render({
      coverage: Number.parseFloat(lineCoverage),
    })
  }
}
