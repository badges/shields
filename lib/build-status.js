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
  let color
  if (happyStatuses.includes(status)) {
    color = 'brightgreen'
  } else if (unhappyStatuses.includes(status)) {
    color = 'red'
  }
  return {
    label,
    message: status,
    color,
  }
}

module.exports = { isBuildStatus, renderBuildStatusBadge }
