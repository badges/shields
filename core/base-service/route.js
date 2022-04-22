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
    const fullPattern = `${makeFullUrl(base, pattern)}:ext(${extensionRegex})`
    const keys = []
    regex = pathToRegexp(fullPattern, keys, {
      strict: true,
      sensitive: true,
    })
    captureNames = keys.map(item => item.name).slice(0, -1)
  }
  return { regex, captureNames }
}

function paramsForReq(captureNames = [], req, ServiceClass) {
  // In addition to the parameters declared by the service, we have one match
  // for the format.
  const expectedNamedParamCount = Object.keys(req.params).length - 1
  if (captureNames.length !== expectedNamedParamCount) {
    throw new Error(
      `Service ${ServiceClass.name} declares incorrect number of named params ` +
        `(expected ${expectedNamedParamCount}, got ${captureNames.length})`
    )
  }

  const namedParams = {}
  captureNames.forEach((name, index) => {
    namedParams[name] = req.params[index]
  })

  // The final capture group is the extension.
  const format = (req.params[expectedNamedParamCount] || '.svg').replace(
    /^\./,
    ''
  )

  return { namedParams, format }
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
  paramsForReq,
  getQueryParamNames,
}
