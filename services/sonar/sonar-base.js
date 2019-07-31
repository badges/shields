'use strict'

const Joi = require('@hapi/joi')
const { isLegacyVersion } = require('./sonar-helpers')
const { BaseJsonService } = require('..')

const modernSchema = Joi.object({
  component: Joi.object({
    measures: Joi.array()
      .items(
        Joi.object({
          metric: Joi.string().required(),
          value: Joi.alternatives(
            Joi.number().min(0),
            Joi.allow('OK', 'ERROR')
          ).required(),
        }).required()
      )
      .required(),
  }).required(),
}).required()

const legacySchema = Joi.array()
  .items(
    Joi.object({
      msr: Joi.array()
        .items(
          Joi.object({
            key: Joi.string().required(),
            val: Joi.alternatives(
              Joi.number().min(0),
              Joi.allow('OK', 'ERROR')
            ).required(),
          }).required()
        )
        .required(),
    }).required()
  )
  .required()

module.exports = class SonarBase extends BaseJsonService {
  static get auth() {
    return { userKey: 'sonarqube_token' }
  }

  async fetch({ sonarVersion, server, component, metricName }) {
    const useLegacyApi = isLegacyVersion({ sonarVersion })

    let qs, url, schema
    if (useLegacyApi) {
      schema = legacySchema
      url = `${server}/api/resources`
      qs = {
        resource: component,
        depth: 0,
        metrics: metricName,
        includeTrends: true,
      }
    } else {
      schema = modernSchema
      url = `${server}/api/measures/component`
      qs = {
        componentKey: component,
        metricKeys: metricName,
      }
    }

    return this._requestJson({
      schema,
      url,
      options: {
        qs,
        auth: this.authHelper.basicAuth,
      },
      errorMessages: {
        404: 'component or metric not found, or legacy API not supported',
      },
    })
  }

  transform({ json, sonarVersion }) {
    const useLegacyApi = isLegacyVersion({ sonarVersion })
    const metrics = {}

    if (useLegacyApi) {
      json[0].msr.forEach(measure => {
        // Most values are numeric, but not all of them.
        metrics[measure.key] = parseInt(measure.val) || measure.val
      })
    } else {
      json.component.measures.forEach(measure => {
        // Most values are numeric, but not all of them.
        metrics[measure.metric] = parseInt(measure.value) || measure.value
      })
    }

    return metrics
  }
}
