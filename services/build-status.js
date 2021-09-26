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

const isBuildStatus = Joi.equal(...allStatuses)

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
