/**
 * @module
 */

import byteSize from 'byte-size'

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
    message: byteSize(bytes, { units }).toString(),
    color: 'blue',
  }
}

export { renderSizeBadge }
