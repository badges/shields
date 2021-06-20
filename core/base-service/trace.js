import chalk from 'chalk'
import config from 'config'
const objectConfig = config.util.toObject()

// Config is loaded globally but it would be better to inject it. To do that,
// there needs to be one instance of the service created at registration time,
// which gets the config injected into it, instead of one instance per request.
// That way most of the current static methods could become instance methods,
// thereby gaining access to the injected config.
const {
  services: { trace: enableTraceLogging },
} = objectConfig.public

function _formatLabelForStage(stage, label) {
  const colorFn = {
    inbound: chalk.black.bgBlue,
    fetch: chalk.black.bgYellow,
    validate: chalk.black.bgGreen,
    unhandledError: chalk.white.bgRed,
    outbound: chalk.black.bgBlue,
  }[stage]
  return colorFn(` ${label} `)
}

function logTrace(stage, symbol, label, content, { deep = false } = {}) {
  if (enableTraceLogging) {
    if (deep) {
      console.log(_formatLabelForStage(stage, label), symbol)
      console.dir(content, { depth: null })
    } else {
      console.log(_formatLabelForStage(stage, label), symbol, '\n', content)
    }
    return true
  } else {
    return false
  }
}

export default {
  logTrace,
}
