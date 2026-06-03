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

/**
 * Formats a stage label with a coloured background for console output.
 *
 * @param {'inbound'|'fetch'|'validate'|'unhandledError'|'outbound'} stage - Pipeline stage name.
 * @param {string} label - Text to display inside the coloured badge.
 * @returns {string} ANSI-coloured label string.
 */
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

/**
 * Logs a trace message to the console when trace logging is enabled in config.
 *
 * @param {'inbound'|'fetch'|'validate'|'unhandledError'|'outbound'} stage - Pipeline stage used to colour the label.
 * @param {string} symbol - Short symbol or emoji prefixed to the log line.
 * @param {string} label - Descriptive label shown alongside the symbol.
 * @param {*} content - Data to print; logged with `console.dir` when `deep` is true.
 * @param {object} [options={}]
 * @param {boolean} [options.deep=false] - When `true`, uses `console.dir` for full-depth output.
 * @returns {boolean} `true` if the message was logged, `false` when trace logging is disabled.
 */
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