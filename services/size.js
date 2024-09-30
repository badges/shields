/**
 * @module
 */

import byteSize from 'byte-size'
import Joi from 'joi'
import { queryParam } from './index.js'

/**
 * Creates a badge object that displays information about a size in bytes number.
 * It should usually be used to output a size badge.
 *
 * @param {number} bytes - Raw number of bytes to be formatted
 * @param {'metric'|'iec'} units - Either 'metric' (multiples of 1000) or 'iec' (multiples of 1024).
 *   This should align with how the upstream displays sizes.
 * @param {string} [label='size'] - Custom label
 * @returns {object} A badge object that has three properties: label, message, and color
 */
function renderSizeBadge(bytes, units, label = 'size') {
  return {
    label,
    message: byteSize(bytes, { units: units.toLowerCase() }).toString(),
    color: 'blue',
  }
}

const unitsDescription = `Units to use for displaying bytes.
- IEC uses multiples of 1024. 1024 bytes = 1 KiB
- Metric uses multiples of 1000. 1000 bytes = 1 kB
`
const unitsEnum = ['IEC', 'metric']
const unitsQueryParam = Joi.string().valid(...unitsEnum)

function unitsOpenApiParam(defaultUnits) {
  return queryParam({
    name: 'units',
    schema: { type: 'string', enum: unitsEnum },
    description: `${unitsDescription}\nDefault: \`${defaultUnits}\``,
  })
}

export { renderSizeBadge, unitsQueryParam, unitsOpenApiParam }
