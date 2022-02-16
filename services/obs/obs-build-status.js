import Joi from 'joi'
import {
  isBuildStatus as gIsBuildStatus,
  renderBuildStatusBadge as gRenderBuildStatusBadge,
} from '../build-status.js'

const localStatuses = {
  blocked: 'inactive',
  disabled: 'inactive',
  finished: 'orange',
  'scheduled-warning': 'orange',
  signing: 'orange',
  unknown: 'inactive',
  unresolvable: 'red',
}

const isBuildStatus = Joi.alternatives().try(
  gIsBuildStatus,
  Joi.equal(...Object.keys(localStatuses))
)

function renderBuildStatusBadge({ repository, status }) {
  const color = localStatuses[status]
  if (color) {
    return {
      message: status.toLowerCase(),
      color,
    }
  } else {
    return gRenderBuildStatusBadge({ status: status.toLowerCase() })
  }
}

export { isBuildStatus, renderBuildStatusBadge }
