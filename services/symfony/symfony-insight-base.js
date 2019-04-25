'use strict'

const Joi = require('joi')
const serverSecrets = require('../../lib/server-secrets')
const { BaseXmlService, Inaccessible } = require('..')

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
      )
        .allow('')
        .required(),
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

const keywords = ['sensiolabs', 'sensio']

const gradeColors = {
  none: 'red',
  bronze: '#C88F6A',
  silver: '#C0C0C0',
  gold: '#EBC760',
  platinum: '#E5E4E2',
}

class SymfonyInsightBase extends BaseXmlService {
  static get category() {
    return 'analysis'
  }

  static get defaultBadgeData() {
    return {
      label: 'symfony insight',
    }
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
}

module.exports = {
  SymfonyInsightBase,
  keywords,
  gradeColors,
}
