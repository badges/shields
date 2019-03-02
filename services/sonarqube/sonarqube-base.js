'use strict'

const Joi = require('joi')
const serverSecrets = require('../../lib/server-secrets')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  component: Joi.object({
    measures: Joi.array()
      .items(
        Joi.object({
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

class SonarQubeBase extends BaseJsonService {
  useLegacyApi({ version }) {
    version = parseFloat(version)
    return !!version && version < 5.4
  }

  getLabel({ metricName }) {
    return metricName.replace(/_/g, ' ')
  }

  transform({ json, useLegacyApi }) {
    const value = parseInt(
      useLegacyApi ? json[0].msr[0].val : json.component.measures[0].value
    )

    return { metricValue: value }
  }

  async fetch({ useLegacyApi, protocol, host, buildType, metricName }) {
    if (metricName === 'tech_debt') {
      //special condition for backwards compatibility
      metricName = 'sqale_debt_ratio'
    }
    let qs, url
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
    })
  }
}

module.exports = {
  patternBase,
  SonarQubeBase,
  queryParamSchema,
}
