'use strict'

const Joi = require('@hapi/joi')
const serverSecrets = require('../../lib/server-secrets')
const { BaseJsonService } = require('..')
const { isLegacyVersion } = require('./sonar-helpers')

const schema = Joi.object({
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

const legacyApiSchema = Joi.array()
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
  async fetch({ sonarVersion, protocol, host, component, metricName }) {
    let qs, url
    const useLegacyApi = isLegacyVersion({ sonarVersion })

    if (useLegacyApi) {
      url = `${protocol}://${host}/api/resources`
      qs = {
        resource: component,
        depth: 0,
        metrics: metricName,
        includeTrends: true,
      }
    } else {
      url = `${protocol}://${host}/api/measures/component`
      qs = {
        componentKey: component,
        metricKeys: metricName,
      }
    }

    const options = { qs }

    if (serverSecrets.sonarqube_token) {
      options.auth = {
        user: serverSecrets.sonarqube_token,
      }
    }

    return this._requestJson({
      schema: useLegacyApi ? legacyApiSchema : schema,
      url,
      options,
      errorMessages: {
        404: 'component or metric not found, or legacy API not supported',
      },
    })
  }

  transform({ json, sonarVersion }) {
    const useLegacyApi = isLegacyVersion({ sonarVersion })
    const rawValue = useLegacyApi
      ? json[0].msr[0].val
      : json.component.measures[0].value
    const value = parseInt(rawValue)

    // Most values are numeric, but not all of them.
    return { metricValue: value || rawValue }
  }
}
