'use strict'

const Joi = require('@hapi/joi')
const { coveragePercentage } = require('../color-formatters')
const JenkinsBase = require('./jenkins-base')
const {
  buildTreeParamQueryString,
  buildUrl,
  queryParamSchema,
} = require('./jenkins-common')

const formatMap = {
  jacoco: {
    schema: Joi.object({
      instructionCoverage: Joi.object({
        percentage: Joi.number()
          .min(0)
          .max(100)
          .required(),
      }).required(),
    }).required(),
    treeQueryParam: 'instructionCoverage[percentage]',
    transform: json => ({ coverage: json.instructionCoverage.percentage }),
  },
  cobertura: {
    schema: Joi.object({
      results: Joi.object({
        elements: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              ratio: Joi.number()
                .min(0)
                .max(100)
                .required(),
            })
          )
          .has(Joi.object({ name: 'Lines' }))
          .min(1)
          .required(),
      }).required(),
    }).required(),
    treeQueryParam: 'results[elements[name,ratio]]',
    transform: json => {
      const lineCoverage = json.results.elements.find(
        element => element.name === 'Lines'
      )
      return { coverage: lineCoverage.ratio }
    },
  },
}

module.exports = class JenkinsCoverage extends JenkinsBase {
  static get category() {
    return 'coverage'
  }

  static get route() {
    return {
      base: 'jenkins/coverage',
      pattern: ':format(jacoco|cobertura)/:protocol(http|https)/:host/:job+',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Jenkins Coverage',
        namedParams: {
          format: 'cobertura',
          protocol: 'https',
          host: 'jenkins.sqlalchemy.org',
          job: 'job/alembic_coverage',
        },
        keywords: ['jacoco', 'cobertura'],
        staticPreview: this.render({ coverage: 95 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'coverage' }
  }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  async handle({ format, protocol, host, job }, { disableStrictSSL }) {
    const { schema, transform, treeQueryParam } = formatMap[format]
    const json = await this.fetch({
      url: buildUrl({ protocol, host, job, plugin: format }),
      schema,
      qs: buildTreeParamQueryString(treeQueryParam),
      disableStrictSSL,
      errorMessages: {
        404: 'job or coverage not found',
      },
    })
    const { coverage } = transform(json)
    return this.constructor.render({ coverage })
  }
}
