/**
 * Common functions and schemas for tasks related to build status.
 *
 * @module
 */

import Joi from 'joi'

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
  'broken',
  'error',
  'errored',
  'failed',
  'failing',
  'failure',
  'infrastructure_failure',
]

const otherStatuses = [
  'aborted',
  'building',
  'canceled',
  'cancelled',
  'created',
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

const allStatuses = greenStatuses
  .concat(orangeStatuses)
  .concat(redStatuses)
  .concat(otherStatuses)

/**
 * Joi schema for validating Build Status.
 * Checks if the build status is present in the list of allowed build status.
 *
 * @type {Joi}
 */
const isBuildStatus = Joi.equal(...allStatuses)

/**
 * Handles rendering concerns of badges that display build status.
 * Determines the message and color of the badge according to the build status.
 *
 * @param {object} attrs Refer to individual attributes
 * @param {string} [attrs.label] If provided then badge label is set to this value
 * @param {string} attrs.status Build status
 * @returns {object} Badge with label, message and color properties
 */
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

export { isBuildStatus, renderBuildStatusBadge }
