'use strict'

const Joi = require('joi')
const { colorScale } = require('../color-formatters')

const patternBase = ':protocol(http|https)/:host(.+)/:component(.+)'
const ratingPercentageScaleSteps = [10, 20, 50, 100]
const ratingScaleColors = [
  'brightgreen',
  'yellowgreen',
  'yellow',
  'orange',
  'red',
]
const negativeMetricColorScale = colorScale(
  ratingPercentageScaleSteps,
  ratingScaleColors
)
const positiveMetricColorScale = colorScale(
  ratingPercentageScaleSteps,
  ratingScaleColors,
  true
)

function isLegacyVersion({ sonarVersion }) {
  sonarVersion = parseFloat(sonarVersion)
  return !!sonarVersion && sonarVersion < 5.4
}

function getLabel({ metric }) {
  return metric ? metric.replace(/_/g, ' ') : undefined
}
const sonarVersionSchema = Joi.alternatives(
  Joi.string()
    .regex(/[0-9.]+/)
    .optional(),
  Joi.number().optional()
)

const queryParamSchema = Joi.object({
  sonarVersion: sonarVersionSchema,
}).required()

const queryParamWithFormatSchema = Joi.object({
  sonarVersion: sonarVersionSchema,
  format: Joi.string()
    .allow('short', 'long')
    .optional(),
}).required()

const keywords = ['sonarcloud', 'sonarqube']
const documentation = `
  <p>
    The Sonar badges will work with both SonarCloud.io and self-hosted SonarQube instances.
    Just enter the correct protocol and path for your target Sonar deployment.
  </p>
  <p>
    If you are targeting a legacy SonarQube instance that is version 5.3 or earlier, then be sure
    to include the version query parameter with the value of your SonarQube version.
  </p
`

module.exports = {
  patternBase,
  getLabel,
  isLegacyVersion,
  queryParamSchema,
  queryParamWithFormatSchema,
  negativeMetricColorScale,
  positiveMetricColorScale,
  keywords,
  documentation,
}
