'use strict'

const Joi = require('joi')

const happyStatuses = ['passed', 'passing', 'success']

const unhappyStatuses = ['error', 'failed', 'failing', 'unstable']

const otherStatuses = [
  'building',
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
  'timeout',
  'waiting',
]

const isBuildStatus = Joi.equal(
  happyStatuses.concat(unhappyStatuses).concat(otherStatuses)
)

function renderBuildStatusBadge({ label, status }) {
  let message
  let color
  if (happyStatuses.includes(status)) {
    message = 'passing'
    color = 'brightgreen'
  } else if (unhappyStatuses.includes(status)) {
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
