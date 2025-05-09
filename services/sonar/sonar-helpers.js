import Joi from 'joi'
import { queryParams } from '../index.js'
import { colorScale } from '../color-formatters.js'
import { url } from '../validators.js'

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
  ratingScaleColors,
)
const positiveMetricColorScale = colorScale(
  ratingPercentageScaleSteps,
  ratingScaleColors,
  true,
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
  Joi.number().optional(),
)

const queryParamSchema = Joi.object({
  sonarVersion: sonarVersionSchema,
  server: url,
}).required()

const openApiQueryParams = queryParams(
  { name: 'server', example: 'https://sonarcloud.io', required: true },
  { name: 'sonarVersion', example: '4.2' },
)

const queryParamWithFormatSchema = Joi.object({
  sonarVersion: sonarVersionSchema,
  server: url,
  format: Joi.string().allow('short', 'long').optional(),
}).required()

const documentation = `
The Sonar badges will work with both SonarCloud.io and self-hosted SonarQube instances.
Just enter the correct protocol and path for your target Sonar deployment.

If you are targeting a legacy SonarQube instance that is version 5.3 or earlier, then be sure
to include the version query parameter with the value of your SonarQube version.
`

export {
  getLabel,
  isLegacyVersion,
  queryParamSchema,
  openApiQueryParams,
  queryParamWithFormatSchema,
  negativeMetricColorScale,
  positiveMetricColorScale,
  documentation,
}
