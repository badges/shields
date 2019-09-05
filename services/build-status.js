'use strict'

const Joi = require('@hapi/joi')

const greenStatuses = [
  'fixed',
  'passed',
  'passing',
  'succeeded',
  'success',
  'successful',
]

const orangeStatuses = ['partially succeeded', 'unstable', 'timeout']

const redStatuses = [
  'error',
  'failed',
  'failing',
  'failure',
  'infrastructure_failure',
]

const otherStatuses = [
  'building',
  'canceled',
  'cancelled',
  'expired',
  'initiated',
  'no builds',
  'no tests',
  'not built',
  'not run',
  'pending',
  'processing',
  'queued',
  'running',
  'scheduled',
  'skipped',
  'starting',
  'stopped',
  'testing',
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
