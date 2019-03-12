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
const badMetricColorScale = colorScale(
  ratingPercentageScaleSteps,
  ratingScaleColors
)
const goodMetricColorScale = colorScale(
  ratingPercentageScaleSteps,
  ratingScaleColors,
  true
)

function isLegacyVersion({ version }) {
  version = parseFloat(version)
  return !!version && version < 5.4
}

function getLabel({ metric }) {
  return metric ? metric.replace(/_/g, ' ') : undefined
}
const versionSchema = Joi.string()
  .regex(/[0-9.]+/)
  .optional()

const queryParamSchema = Joi.object({
  version: versionSchema,
}).required()

const queryParamWithFormatSchema = Joi.object({
  version: versionSchema,
  format: Joi.string()
    .allow('short', 'long')
    .optional(),
}).required()

module.exports = {
  patternBase,
  getLabel,
  isLegacyVersion,
  queryParamSchema,
  queryParamWithFormatSchema,
  badMetricColorScale,
  goodMetricColorScale,
}
