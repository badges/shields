import escapeStringRegexp from 'escape-string-regexp'
import Joi from 'joi'
import { pathToRegexp } from 'path-to-regexp'

function makeFullUrl(base, partialUrl) {
  return `/${[base, partialUrl].filter(Boolean).join('/')}`
}

const isValidRoute = Joi.object({
  base: Joi.string().allow('').required(),
  pattern: Joi.string().allow(''),
  format: Joi.string(),
  capture: Joi.alternatives().conditional('format', {
    is: Joi.string().required(),
    then: Joi.array().items(Joi.string().required()),
  }),
  queryParamSchema: Joi.object().schema(),
})
  .xor('pattern', 'format')
  .required()

function assertValidRoute(route, message = undefined) {
  Joi.assert(route, isValidRoute, message)
}

function prepareRoute({ base, pattern, format, capture, withPng }) {
  const extensionRegex = ['', '.svg', '.json']
    .concat(withPng ? ['.png'] : [])
    .map(escapeStringRegexp)
    .join('|')
  let regex, captureNames
  if (pattern === undefined) {
    regex = new RegExp(`^${makeFullUrl(base, format)}(${extensionRegex})$`)
    captureNames = capture || []
  } else {
    const fullPatternWithoutExt = `${makeFullUrl(base, pattern)}`
    const keys = []
    const pathRegex = pathToRegexp(fullPatternWithoutExt, keys, {
      trailing: false,
      sensitive: true,
    })
    const sourceWithoutEnd = pathRegex.regexp.source.replace(/\$$/, '')
    // workaround for path-to-regexp not supporting regex anymore
    regex = new RegExp(
      `${sourceWithoutEnd}(${extensionRegex})$`,
      pathRegex.regexp.flags,
    )
    captureNames = keys.map(item => item.name)
  }
  return { regex, captureNames }
}

function namedParamsForMatch(captureNames = [], match, ServiceClass) {
  // Assume the last match is the format, and drop match[0], which is the
  // entire match.
  const captures = match.slice(1, -1)

  if (captureNames.length !== captures.length) {
    throw new Error(
      `Service ${ServiceClass.name} declares incorrect number of named params ` +
        `(expected ${captures.length}, got ${captureNames.length})`,
    )
  }

  const result = {}
  captureNames.forEach((name, index) => {
    result[name] = captures[index]
  })
  return result
}

function getQueryParamNames({ queryParamSchema }) {
  if (queryParamSchema) {
    const { keys, renames = [] } = queryParamSchema.describe()
    return Object.keys(keys).concat(renames.map(({ from }) => from))
  } else {
    return []
  }
}

export {
  makeFullUrl,
  isValidRoute,
  assertValidRoute,
  prepareRoute,
  namedParamsForMatch,
  getQueryParamNames,
}
