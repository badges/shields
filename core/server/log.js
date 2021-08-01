import Sentry from '@sentry/node'

const listeners = []

// Zero-pad a number in a string.
// eg. 4 becomes 04 but 17 stays 17.
function pad(string) {
  string = String(string)
  return string.length < 2 ? `0${string}` : string
}

// Compact date representation.
// eg. 0611093840 for June 11, 9:38:40 UTC.
function date() {
  const date = new Date()
  return (
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds())
  )
}

const log = (...msg) => {
  const d = date()
  listeners.forEach(f => f(d, ...msg))
  console.log(d, ...msg)
}

const error = err => {
  const d = date()
  listeners.forEach(f => f(d, err))
  Sentry.captureException(err)
  console.error(d, err)
}

const addListener = func => listeners.push(func)

const removeListener = func => {
  const index = listeners.indexOf(func)
  if (index < 0) {
    return
  }
  listeners.splice(index, 1)
}

export default {
  log,
  error,
  addListener,
  removeListener,
}
