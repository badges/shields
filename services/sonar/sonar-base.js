import Joi from 'joi'
import { BaseJsonService, NotFound } from '../index.js'
import { isLegacyVersion } from './sonar-helpers.js'

// It is possible to see HTTP 404 response codes and HTTP 200 responses
// with empty arrays of metric values, with both the legacy (pre v5.3) and modern APIs.
//
// 404 responses can occur with non-existent component keys, as well as unknown/unsupported metrics.
//
// 200 responses with empty arrays can occur when the metric key is valid, but the data
// is unavailable for the specified component, for example using the metric key `tests` with a
// component that is not capturing test results.
// It can also happen when using an older/deprecated
// metric key with a newer version of Sonar, for example using the metric key
// `public_documented_api_density` with SonarQube v7.x or higher

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
        })
      )
      .min(0)
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
          })
        )
        .required(),
    }).required()
  )
  .required()

export default class SonarBase extends BaseJsonService {
  static auth = { userKey: 'sonarqube_token', serviceKey: 'sonar' }

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

    return this._requestJson(
      this.authHelper.withBasicAuth({
        schema,
        url,
        options: { qs },
        errorMessages: {
          404: 'component or metric not found, or legacy API not supported',
        },
      })
    )
  }

  transform({ json, sonarVersion }) {
    const useLegacyApi = isLegacyVersion({ sonarVersion })
    const metrics = {}

    if (useLegacyApi) {
      const [{ msr: measures }] = json
      if (!measures.length) {
        throw new NotFound({ prettyMessage: 'metric not found' })
      }
      measures.forEach(measure => {
        // Most values are numeric, but not all of them.
        metrics[measure.key] = parseInt(measure.val) || measure.val
      })
    } else {
      const {
        component: { measures },
      } = json
      if (!measures.length) {
        throw new NotFound({ prettyMessage: 'metric not found' })
      }
      measures.forEach(measure => {
        // Most values are numeric, but not all of them.
        metrics[measure.metric] = parseInt(measure.value) || measure.value
      })
    }

    return metrics
  }
}
