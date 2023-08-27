import Joi from 'joi'
import { coveragePercentage } from '../color-formatters.js'
import JenkinsBase from './jenkins-base.js'
import {
  buildTreeParamQueryString,
  buildUrl,
  queryParamSchema,
} from './jenkins-common.js'

const formatMap = {
  jacoco: {
    schema: Joi.object({
      instructionCoverage: Joi.object({
        percentage: Joi.number().min(0).max(100).required(),
      }).required(),
    }).required(),
    treeQueryParam: 'instructionCoverage[percentage]',
    transform: json => ({ coverage: json.instructionCoverage.percentage }),
    pluginSpecificPath: 'jacoco',
  },
  cobertura: {
    schema: Joi.object({
      results: Joi.object({
        elements: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              ratio: Joi.number().min(0).max(100).required(),
            }),
          )
          .has(Joi.object({ name: 'Lines' }))
          .min(1)
          .required(),
      }).required(),
    }).required(),
    treeQueryParam: 'results[elements[name,ratio]]',
    transform: json => {
      const lineCoverage = json.results.elements.find(
        element => element.name === 'Lines',
      )
      return { coverage: lineCoverage.ratio }
    },
    pluginSpecificPath: 'cobertura',
  },
  apiv1: {
    schema: Joi.object({
      results: Joi.object({
        elements: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              ratio: Joi.number().min(0).max(100).required(),
            }),
          )
          .has(Joi.object({ name: 'Line' }))
          .min(1)
          .required(),
      }).required(),
    }).required(),
    treeQueryParam: 'results[elements[name,ratio]]',
    transform: json => {
      const lineCoverage = json.results.elements.find(
        element => element.name === 'Line',
      )
      return { coverage: lineCoverage.ratio }
    },
    pluginSpecificPath: 'coverage/result',
  },
  apiv4: {
    schema: Joi.object({
      projectStatistics: Joi.object({
        line: Joi.string()
          .pattern(/\d+\.\d+%/)
          .required(),
      }).required(),
    }).required(),
    treeQueryParam: 'projectStatistics[line]',
    transform: json => {
      const lineCoverageStr = json.projectStatistics.line
      const lineCoverage = lineCoverageStr.substring(
        0,
        lineCoverageStr.length - 1,
      )
      return { coverage: Number.parseFloat(lineCoverage) }
    },
    pluginSpecificPath: 'coverage',
  },
}

const documentation = `
<p>
  We support coverage metrics from a variety of Jenkins plugins:
  <ul>
    <li><a href="https://plugins.jenkins.io/jacoco">JaCoCo</a></li>
    <li><a href="https://plugins.jenkins.io/cobertura">Cobertura</a></li>
    <li>Any plugin which integrates with version 1 or 4+ of the <a href="https://plugins.jenkins.io/code-coverage-api">Code Coverage API</a> (e.g. llvm-cov, Cobertura 1.13+, etc.)</li>
  </ul>
</p>
`

export default class JenkinsCoverage extends JenkinsBase {
  static category = 'coverage'

  static route = {
    base: 'jenkins/coverage',
    pattern: ':format(jacoco|cobertura|apiv1|apiv4)',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Jenkins Coverage',
      namedParams: {
        format: 'cobertura',
      },
      queryParams: {
        jobUrl: 'https://jenkins.sqlalchemy.org/job/alembic_coverage',
      },
      keywords: ['jacoco', 'cobertura', 'llvm-cov', 'istanbul'],
      staticPreview: this.render({ coverage: 95 }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'coverage' }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  async handle({ format }, { jobUrl }) {
    const { schema, transform, treeQueryParam, pluginSpecificPath } =
      formatMap[format]
    const json = await this.fetch({
      url: buildUrl({ jobUrl, plugin: pluginSpecificPath }),
      schema,
      searchParams: buildTreeParamQueryString(treeQueryParam),
      httpErrors: {
        404: 'job or coverage not found',
      },
    })
    const { coverage } = transform(json)
    return this.constructor.render({ coverage })
  }
}
