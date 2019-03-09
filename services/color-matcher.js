'use strict'

const Joi = require('joi')
const matchColors = {
  red: '#f00',
  orange: '#ff0',
  brightgreen: '#0f0',
}
const nearestColor = require('nearest-color').from(matchColors)

const isColorMatcher = Joi.equal([
  'passing',
  'building',
  'failing',
  'app not found',
])

function renderColorStatusBadge({ label, status }) {
  status = status.includes('#') ? status : `#${status}`
  const nearest = nearestColor(status)
  let message
  const color = nearest.name
  if (nearest.name === 'brightgreen') {
    message = 'passing'
  } else if (nearest.name === 'orange') {
    message = 'building'
  } else {
    message = 'failing'
  }
  return {
    label,
    message,
    color,
  }
}

module.exports = { isColorMatcher, renderColorStatusBadge }
