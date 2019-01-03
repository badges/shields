'use strict'

const Joi = require('joi')
const BaseXmlService = require('../base-xml')
const serverSecrets = require('../../lib/server-secrets')
const { Inaccessible } = require('../errors')

const violationSchema = Joi.object({
  severity: Joi.equal('info', 'minor', 'major', 'critical').required(),
}).required()

const schema = Joi.object({
  project: Joi.object({
    'last-analysis': Joi.object({
      status: Joi.equal(
        'ordered',
        'running',
        'measured',
        'analyzed',
        'finished'
      ).required(),
      grade: Joi.equal('platinum', 'gold', 'silver', 'bronze', 'none'),
      violations: Joi.object({
        // RE: https://github.com/NaturalIntelligence/fast-xml-parser/issues/68
        // The BaseXmlService uses the fast-xml-parser which doesn't support forcing
        // the xml nodes to always be parsed as an array. Currently, if the response
        // only contains a single violation then it will be parsed as an object,
        // otherwise it will be parsed as an array.
        violation: Joi.array()
          .items(violationSchema)
          .single()
          .required(),
      }),
    }),
  }).required(),
}).required()

const keywords = ['sensiolabs']

module.exports = class SymfonyInsight extends BaseXmlService {
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
        label: metric,
        message: 'pending',
        color: 'lightgrey',
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
      color = '#E5E4E2'
    } else if (grade === 'gold') {
      color = '#EBC760'
    } else if (grade === 'silver') {
      color = '#C0C0C0'
    } else if (grade === 'bronze') {
      color = '#C88F6A'
    } else {
      message = 'no medal'
      color = 'red'
    }

    return {
      label: 'grade',
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
        label: 'violations',
        message: '0',
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
      violationSummary.unshift(`${numCriticalViolations} critical`)
      color = 'red'
    }

    return {
      label: 'violations',
      message: violationSummary.join(', '),
      color,
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'symfony insight',
    }
  }

  static get category() {
    return 'quality'
  }

  static get route() {
    return {
      base: '',
      // The SymfonyInsight service was previously branded as SensioLabs, and
      // accordingly the badge path used to be /sensiolabs/i/projectUuid'.
      // This is used to provide backward compatibility for the old path as well as
      // supporting the new/current path.
      format: '(?:sensiolabs/i|symfony/i/(grade|violations))/([^/]+)',
      capture: ['metric', 'projectUuid'],
    }
  }

  static get examples() {
    return [
      {
        title: 'SymfonyInsight Grade',
        pattern: 'symfony/i/grade/:projectUuid',
        namedParams: {
          projectUuid: '45afb680-d4e6-4e66-93ea-bcfa79eb8a87',
        },
        staticPreview: this.renderGradeBadge({
          grade: 'bronze',
        }),
        keywords,
      },
      {
        title: 'SymfonyInsight Violations',
        pattern: 'symfony/i/violations/:projectUuid',
        namedParams: {
          projectUuid: '45afb680-d4e6-4e66-93ea-bcfa79eb8a87',
        },
        staticPreview: this.renderViolationsBadge({
          numViolations: 0,
        }),
        keywords,
      },
    ]
  }

  async fetch({ projectUuid }) {
    const url = `https://insight.symfony.com/api/projects/${projectUuid}`
    const options = {
      headers: {
        Accept: 'application/vnd.com.sensiolabs.insight+xml',
      },
    }

    if (
      !serverSecrets.sl_insight_userUuid ||
      !serverSecrets.sl_insight_apiToken
    ) {
      throw new Inaccessible({
        prettyMessage: 'required API tokens not found in config',
      })
    }

    options.auth = {
      user: serverSecrets.sl_insight_userUuid,
      pass: serverSecrets.sl_insight_apiToken,
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
    if (violationContainer && violationContainer.violation) {
      let violations = []
      // See above note on schema RE: https://github.com/NaturalIntelligence/fast-xml-parser/issues/68
      // This covers the scenario of multiple violations which are parsed as an array and single
      // violations which is parsed as a single object.
      if (Array.isArray(violationContainer.violation)) {
        violations = violationContainer.violation
      } else {
        violations.push(violationContainer.violation)
      }
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
