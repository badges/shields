import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { coveragePercentage } from '../color-formatters.js'
import { optionalUrl } from '../validators.js'
import JenkinsBase from './jenkins-base.js'
import { buildTreeParamQueryString, buildUrl } from './jenkins-common.js'

const queryParamSchema = Joi.object({
  jobUrl: optionalUrl,
  metric: Joi.string()
    .valid('line', 'branch', 'instruction', 'method', 'module', 'file')
    .default('line'),
}).required()

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
          .optional(),
        branch: Joi.string()
          .pattern(/\d+\.\d+%/)
          .optional(),
        instruction: Joi.string()
          .pattern(/\d+\.\d+%/)
          .optional(),
        method: Joi.string()
          .pattern(/\d+\.\d+%/)
          .optional(),
        module: Joi.string()
          .pattern(/\d+\.\d+%/)
          .optional(),
        file: Joi.string()
          .pattern(/\d+\.\d+%/)
          .optional(),
      }).required(),
    }).required(),
    treeQueryParam:
      'projectStatistics[line,branch,instruction,method,module,file]',
    transform: (json, metric) => {
      const raw = json.projectStatistics[metric]
      if (!raw) throw new Error(`metric '${metric}' not found`)
      return { coverage: Number.parseFloat(raw) }
    },
    pluginSpecificPath: 'coverage',
  },
}

const description = `
We support coverage metrics from a variety of Jenkins plugins:

<ul>
  <li><a href="https://plugins.jenkins.io/jacoco">JaCoCo</a></li>
  <li><a href="https://plugins.jenkins.io/cobertura">Cobertura</a></li>
  <li>Any plugin which integrates with version 1 or 4+ of the <a href="https://plugins.jenkins.io/code-coverage-api">Code Coverage API</a> (e.g. llvm-cov, Cobertura 1.13+, etc.)</li>
  <li>The new <a href="https://plugins.jenkins.io/coverage">Coverage Plugin</a> (use format <code>apiv4</code> with optional <code>metric</code> parameter)</li>
</ul>
`

export default class JenkinsCoverage extends JenkinsBase {
  static category = 'coverage'

  static route = {
    base: 'jenkins/coverage',
    pattern: ':format(jacoco|cobertura|apiv1|apiv4)',
    queryParamSchema,
  }

  static openApi = {
    '/jenkins/coverage/{format}': {
      get: {
        summary: 'Jenkins Coverage',
        description,
        parameters: [
          pathParam({
            name: 'format',
            example: 'jacoco',
            schema: { type: 'string', enum: this.getEnum('format') },
          }),
          queryParam({
            name: 'jobUrl',
            example:
              'https://jenkins-2.sse.uni-hildesheim.de/job/Teaching_SubmissionCheck',
            required: true,
          }),
          queryParam({
            name: 'metric',
            example: 'line',
            description:
              'Coverage metric to display (only for apiv4 format). One of: line, branch, instruction, method, module, file. Defaults to line.',
            schema: {
              type: 'string',
              enum: [
                'line',
                'branch',
                'instruction',
                'method',
                'module',
                'file',
              ],
            },
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

  async handle({ format }, { jobUrl, metric = 'line' }) {
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
    const { coverage } = transform(json, metric)
    return this.constructor.render({ coverage })
  }
}
