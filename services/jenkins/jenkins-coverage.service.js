'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const serverSecrets = require('../../lib/server-secrets')

const {
  coveragePercentage: coveragePercentageColor,
} = require('../../lib/color-formatters')

const jacocoCoverageSchema = Joi.object({
  instructionCoverage: Joi.object({
    percentage: Joi.number()
      .min(0)
      .max(100)
      .required(),
  }).required(),
}).required()

const coberturaCoverageSchema = Joi.object({
  results: Joi.object({
    elements: Joi.array()
      .items(
        Joi.object({
          name: 'Lines',
          ratio: Joi.number()
            .min(0)
            .max(100)
            .required(),
        })
      )
      .min(1)
      .required(),
  }).required(),
}).required()

class BaseJenkinsCoverage extends BaseJsonService {
  async fetch({ url, options, schema }) {
    return this._requestJson({
      url,
      options,
      schema,
      errorMessages: {
        404: 'job or coverage not found',
      },
    })
  }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentageColor(coverage),
    }
  }

  static get defaultBadgeData() {
    return { label: 'coverage' }
  }

  static get category() {
    return 'build'
  }

  static buildUrl(scheme, host, job, plugin) {
    return `${scheme}://${host}/job/${job}/lastBuild/${plugin}/api/json`
  }

  static buildOptions(treeParam) {
    const options = {
      qs: {
        tree: treeParam,
      },
    }
    if (serverSecrets && serverSecrets.jenkins_user) {
      options.auth = {
        user: serverSecrets.jenkins_user,
        pass: serverSecrets.jenkins_pass,
      }
    }
    return options
  }
}

class JacocoJenkinsCoverage extends BaseJenkinsCoverage {
  async handle({ scheme, host, job }) {
    const url = this.constructor.buildUrl(scheme, host, job, 'jacoco')
    const options = this.constructor.buildOptions(
      'instructionCoverage[percentage]'
    )
    const json = await this.fetch({
      url,
      options,
      schema: jacocoCoverageSchema,
    })
    return this.constructor.render({
      coverage: json.instructionCoverage.percentage,
    })
  }

  static get route() {
    return {
      base: 'jenkins/j',
      format: '(http(?:s)?)/([^/]+)/(?:job/)?(.+)',
      capture: ['scheme', 'host', 'job'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Jenkins JaCoCo coverage',
        exampleUrl: 'https/ci.eclipse.org/ecp/job/gerrit',
        pattern: ':scheme/:host/:job',
        staticExample: this.render({
          coverage: 96,
        }),
      },
    ]
  }
}

class CoberturaJenkinsCoverage extends BaseJenkinsCoverage {
  async handle({ scheme, host, job }) {
    const url = this.constructor.buildUrl(scheme, host, job, 'cobertura')
    const options = this.constructor.buildOptions(
      'results[elements[name,ratio]]'
    )
    const json = await this.fetch({
      url,
      options,
      schema: coberturaCoverageSchema,
    })
    return this.constructor.render({
      coverage: json.results.elements[0].ratio,
    })
  }

  static get route() {
    return {
      base: 'jenkins/c',
      format: '(http(?:s)?)/([^/]+)/(?:job/)?(.+)',
      capture: ['scheme', 'host', 'job'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Jenkins Cobertura coverage',
        exampleUrl: 'https/builds.apache.org/job/olingo-odata4-cobertura',
        pattern: ':scheme/:host/:job',
        staticExample: this.render({
          coverage: 94,
        }),
      },
    ]
  }
}

module.exports = {
  JacocoJenkinsCoverage,
  CoberturaJenkinsCoverage,
}
