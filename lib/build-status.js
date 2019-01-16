'use strict'

const Joi = require('joi')

const greenStatuses = [
  'fixed',
  'passed',
  'passing',
  'succeeded',
  'success',
  'successful',
]

const orangeStatuses = ['partially succeeded', 'unstable', 'timeout']

const redStatuses = ['error', 'failed', 'failing']

const otherStatuses = [
  'building',
  'canceled',
  'cancelled',
  'expired',
  'no tests',
  'not built',
  'not run',
  'pending',
  'processing',
  'queued',
  'running',
  'scheduled',
  'skipped',
  'stopped',
  'waiting',
]

const isBuildStatus = Joi.equal(
  greenStatuses
    .concat(orangeStatuses)
    .concat(redStatuses)
    .concat(otherStatuses)
)

function renderBuildStatusBadge({ label, status }) {
  let message
  let color
  if (greenStatuses.includes(status)) {
    message = 'passing'
    color = 'brightgreen'
  } else if (orangeStatuses.includes(status)) {
    message = status === 'partially succeeded' ? 'passing' : status
    color = 'orange'
  } else if (redStatuses.includes(status)) {
    message = status === 'failed' ? 'failing' : status
    color = 'red'
  } else {
    message = status
  }
  return {
    label,
    message,
    color,
  }
}

module.exports = { isBuildStatus, renderBuildStatusBadge }
