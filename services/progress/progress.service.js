/**
 * Progress / Percentage Badge
 * Displays a percentage with gradient-based coloring.
 * Data is provided via URL parameters (static/generic badge).
 */

import Joi from 'joi'
import { BaseStaticService, InvalidParameter, queryParams } from '../index.js'
import { gradientColorForPercentage } from './progress-gradient.js'

const queryParamSchema = Joi.object({
  label: Joi.string().allow('').optional(),
  message: Joi.string().allow('').optional(),
  percentage: Joi.alternatives()
    .try(Joi.number().min(0).max(100), Joi.number().min(0).max(1))
    .optional(),
  numerator: Joi.number().integer().min(0).optional(),
  denominator: Joi.number().integer().min(1).optional(),
  gradient: Joi.string().optional(),
}).required()

const description = `
Visualize progress or percentages with gradient-based coloring.

**Percentage input** (one of):
- <code>percentage</code>: 0-100 (integer) or 0.00-1.00 (decimal)
- <code>numerator</code> + <code>denominator</code>: Computed as numerator/denominator × 100

**Gradient options**:
- <code>red-green</code>: 0% red → 100% green
- <code>green-red</code>: 0% green → 100% red
- <code>red-yellow-green</code>: red → yellow → green
- <code>green-yellow-red</code>: green → yellow → red
- Custom: <code>color1-color2-color3</code> (hex or CSS color names)

**Examples**:
- Development progress: <code>/badge/progress?label=Docs&percentage=75&gradient=red-green</code>
- Quality rating: <code>/badge/progress?label=Quality&numerator=4&denominator=5&gradient=red-yellow-green</code>
`

export default class ProgressBadge extends BaseStaticService {
  static category = 'other'

  static route = {
    base: 'badge/progress',
    pattern: '',
    queryParamSchema,
  }

  static openApi = {
    '/badge/progress': {
      get: {
        summary: 'Progress / Percentage Badge',
        description,
        parameters: queryParams(
          {
            name: 'label',
            schema: { type: 'string' },
            example: 'progress',
          },
          {
            name: 'message',
            schema: { type: 'string' },
            description: 'Optional; if empty shows percentage with %',
          },
          {
            name: 'percentage',
            schema: { type: 'number' },
            description: '0-100 or 0.00-1.00',
          },
          {
            name: 'numerator',
            schema: { type: 'integer' },
          },
          {
            name: 'denominator',
            schema: { type: 'integer' },
          },
          {
            name: 'gradient',
            schema: {
              type: 'string',
              enum: [
                'red-green',
                'green-red',
                'red-yellow-green',
                'green-yellow-red',
              ],
            },
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'progress',
  }

  handle(namedParams, queryParams) {
    const { label, message, percentage, numerator, denominator, gradient } =
      queryParams

    let value
    if (percentage !== undefined) {
      value = percentage <= 1 ? percentage * 100 : percentage
    } else if (numerator !== undefined && denominator !== undefined) {
      value = (numerator / denominator) * 100
    } else if (numerator !== undefined || denominator !== undefined) {
      throw new InvalidParameter({
        prettyMessage: 'numerator and denominator required together',
      })
    } else {
      throw new InvalidParameter({
        prettyMessage: 'percentage or numerator+denominator required',
      })
    }

    const pct = Math.max(0, Math.min(100, value))
    const gradientKey = gradient || 'red-green'
    const color = gradientColorForPercentage(pct, gradientKey)

    const displayMessage =
      message !== undefined && message !== '' ? message : `${pct.toFixed(0)}%`

    return {
      label: label ?? 'progress',
      message: displayMessage,
      color,
    }
  }
}
