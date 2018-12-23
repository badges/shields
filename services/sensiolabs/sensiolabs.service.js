'use strict'

const Joi = require('joi')
const BaseXmlService = require('../base-xml')
const serverSecrets = require('../../lib/server-secrets')

const schema = Joi.object({
  project: Joi.object({
    'last-analysis': Joi.object({
      status: Joi.string()
        .regex(/ordered|running|measured|analyzed|finished/)
        .required(),
      grade: Joi.string()
        .regex(/platinum|gold|silver|bronze|none/)
        .allow('', null),
      violations: Joi.object({
        violation: Joi.array()
          .optional()
          .items(
            Joi.object({
              severity: Joi.string()
                .regex(/info|minor|major|critical/)
                .required(),
            })
          ),
      })
        .optional()
        .allow(''),
    }),
  }).required(),
}).required()

module.exports = class Sensiolabs extends BaseXmlService {
  static render({
    metric,
    status,
    grade,
    numViolations,
    numCriticalViolations,
    numMajorViolations,
    numMinorViolations,
    numInfoViolations,
  }) {
    if (status !== 'finished') {
      return {
        message: 'pending',
        color: 'grey',
      }
    }

    if (metric === 'grade') {
      return this.renderGradeBadge({ grade })
    } else {
      return this.renderViolationsBadge({
        numViolations,
        numCriticalViolations,
        numMajorViolations,
        numMinorViolations,
        numInfoViolations,
      })
    }
  }

  static renderGradeBadge({ grade }) {
    let color,
      message = grade
    if (grade === 'platinum') {
      color = 'brightgreen'
    } else if (grade === 'gold') {
      color = 'yellow'
    } else if (grade === 'silver') {
      color = 'lightgrey'
    } else if (grade === 'bronze') {
      color = 'orange'
    } else {
      message = 'no medal'
      color = 'red'
    }

    return {
      message,
      color,
    }
  }

  static renderViolationsBadge({
    numViolations,
    numCriticalViolations,
    numMajorViolations,
    numMinorViolations,
    numInfoViolations,
  }) {
    if (numViolations === 0) {
      return {
        message: '0 violations',
        color: 'brightgreen',
      }
    }

    let color = 'yellowgreen'
    const violationSummary = []

    if (numInfoViolations > 0) {
      violationSummary.push(`${numInfoViolations} info`)
    }
    if (numMinorViolations > 0) {
      violationSummary.unshift(`${numMinorViolations} minor`)
      color = 'yellow'
    }
    if (numMajorViolations > 0) {
      violationSummary.unshift(`${numMajorViolations} major`)
      color = 'orange'
    }
    if (numCriticalViolations > 0) {
      violationSummary.unshift(`${numCriticalViolations} major`)
      color = 'red'
    }

    return {
      message: violationSummary.join(', '),
      color,
    }
  }

  static get category() {
    return 'quality'
  }

  static get route() {
    return {
      // base: '(symfony|sensiolabs)/i',
      // pattern: ':metric(grade|violations)?/:projectUuid',
      pattern: '(symfony|sensiolabs)/i/:metric(grade|violations)?/:projectUuid',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'checks',
    }
  }

  static get examples() {
    return [
      {
        title: 'SensioLabs Insight Grade',
        pattern: 'grade/:projectUuid',
        namedParams: {
          projectUuid: '45afb680-d4e6-4e66-93ea-bcfa79eb8a87',
        },
        staticPreview: this.renderGradeBadge({
          grade: 'bronze',
        }),
      },
      {
        title: 'SensioLabs Insight Violations',
        pattern: 'violations/:projectUuid',
        namedParams: {
          projectUuid: '45afb680-d4e6-4e66-93ea-bcfa79eb8a87',
        },
        staticPreview: this.renderGradeBadge({
          numViolations: 0,
        }),
      },
    ]
  }

  async fetch({ projectUuid }) {
    const url = `https://insight.sensiolabs.com/api/projects/${projectUuid}`
    const options = {
      headers: {
        Accept: 'application/vnd.com.sensiolabs.insight+xml',
      },
    }

    if (serverSecrets && serverSecrets.sl_insight_userUuid) {
      options.auth = {
        user: serverSecrets.sl_insight_userUuid,
        pass: serverSecrets.sl_insight_apiToken,
      }
    }

    return this._requestXml({
      url,
      options,
      schema,
      errorMessages: {
        401: 'not authorized to access project',
        404: 'project not found',
      },
      parserOptions: {
        attributeNamePrefix: '',
        ignoreAttributes: false,
      },
    })
  }

  transform({ data }) {
    const lastAnalysis = data.project['last-analysis']
    let numViolations = 0
    let numCriticalViolations = 0
    let numMajorViolations = 0
    let numMinorViolations = 0
    let numInfoViolations = 0

    const violationContainer = lastAnalysis.violations

    if (violationContainer && violationContainer.violations) {
      const violations = violationContainer.violations
      numViolations = violations.length
      violations.forEach(violation => {
        if (violation.severity === 'critical') {
          numCriticalViolations++
        } else if (violation.severity === 'major') {
          numMajorViolations++
        } else if (violation.severity === 'minor') {
          numMinorViolations++
        } else {
          numInfoViolations++
        }
      })
    }

    return {
      status: lastAnalysis.status,
      grade: lastAnalysis.grade,
      numViolations,
      numCriticalViolations,
      numMajorViolations,
      numMinorViolations,
      numInfoViolations,
    }
  }

  async handle({ metric = 'grade', projectUuid }) {
    const data = await this.fetch({ projectUuid })
    const {
      status,
      grade,
      numViolations,
      numCriticalViolations,
      numMajorViolations,
      numMinorViolations,
      numInfoViolations,
    } = this.transform({ data })

    return this.constructor.render({
      metric,
      status,
      grade,
      numViolations,
      numCriticalViolations,
      numMajorViolations,
      numMinorViolations,
      numInfoViolations,
    })
  }
}
