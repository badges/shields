import Joi from 'joi'

// colors from OBS webinterface
/* const statusmap = {
	//Green
	succeeded: "#008000",
	// Blue
	building: "#069",
	// Cyan
	scheduled: "#007a7c",
	// Yellow
	signing: "#f0ad4e",
	finished: "#f0ad4e",
	// Red
	unresolvable: "#dc3545",
	broken: "#dc3545",
	failed: "#dc3545",
	// Gray
	disabled: "#6c757d",
	blocked: "#6c757d",
	// Orange
	"scheduled-warning": "#a50",
	unknown: "#a50"
} */

// shields colors
const statusmap = {
  // Green
  succeeded: 'success',
  // Blue
  building: 'blue',
  // Cyan
  scheduled: '#007a7c',
  // Yellow
  signing: 'yellow',
  finished: 'yellow',
  // Red
  unresolvable: 'critical',
  broken: 'critical',
  failed: 'critical',
  // Gray
  disabled: 'inactive',
  blocked: 'inactive',
  // Orange
  'scheduled-warning': 'important',
  unknown: 'lightgray',
}

const isBuildStatus = Joi.equal(...Object.keys(statusmap))
function getIsMessageStatus() {
  const status = []
  Object.keys(statusmap).forEach(key =>
    status.push(key.charAt(0).toUpperCase() + key.slice(1))
  )

  return Joi.equal(...status)
}

function renderBuildStatusBadge({ repository, status }) {
  const color = statusmap[status]

  return {
    label: repository.replace(/_/g, ' '),
    message: status.charAt(0).toUpperCase() + status.slice(1),
    color,
  }
}

export { isBuildStatus, getIsMessageStatus, renderBuildStatusBadge }
