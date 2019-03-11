'use strict'

const Joi = require('joi')
const serverSecrets = require('../../lib/server-secrets')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  component: Joi.object({
    measures: Joi.array()
      .items(
        Joi.object({
          metric: Joi.string(),
          value: Joi.number()
            .min(0)
            .required(),
        })
      )
      .min(0)
      .required(),
  }).required(),
}).required()

const legacyApiSchema = Joi.array()
  .items(
    Joi.object({
      msr: Joi.array()
        .items(
          Joi.object({
            metric: Joi.string(),
            val: Joi.number()
              .min(0)
              .required(),
          })
        )
        .min(0)
        .required(),
    })
  )
  .min(0)
  .required()

const queryParamSchema = Joi.object({
  version: Joi.string()
    .regex(/[0-9.]+/)
    .optional(),
}).required()

const patternBase = ':protocol(http|https)/:host(.+)/:buildType(.+)'

class SonarBase extends BaseJsonService {
  useLegacyApi({ version }) {
    version = parseFloat(version)
    return !!version && version < 5.4
  }

  static getLabel({ metric }) {
    return metric ? metric.replace(/_/g, ' ') : undefined
  }

  transform({ json, version }) {
    const useLegacyApi = this.useLegacyApi({ version })
    const value = parseInt(
      useLegacyApi ? json[0].msr[0].val : json.component.measures[0].value
    )

    return { metricValue: value }
  }

  async fetch({ version, protocol, host, buildType, metricName }) {
    let qs, url
    const useLegacyApi = this.useLegacyApi({ version })
    if (useLegacyApi) {
      url = `${protocol}://${host}/api/resources`
      qs = {
        resource: buildType,
        depth: 0,
        metrics: metricName,
        includeTrends: true,
      }
    } else {
      url = `${protocol}://${host}/api/measures/component`
      qs = {
        componentKey: buildType,
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
}

module.exports = {
  patternBase,
  SonarBase,
  queryParamSchema,
}
