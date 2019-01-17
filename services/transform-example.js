'use strict'

const Joi = require('joi')
const pathToRegexp = require('path-to-regexp')

const optionalObjectOfKeyValues = Joi.object().pattern(
  /./,
  Joi.string().allow(null)
)

const optionalServiceData = Joi.object({
  label: Joi.string(),
  message: Joi.alternatives()
    .try(
      Joi.string()
        .allow('')
        .required(),
      Joi.number()
    )
    .required(),
  color: Joi.string(),
})

const schema = Joi.object({
  // This should be:
  // title: Joi.string().required(),
  title: Joi.string(),
  namedParams: optionalObjectOfKeyValues,
  queryParams: optionalObjectOfKeyValues.default({}),
  pattern: Joi.string(),
  staticPreview: optionalServiceData,
  previewUrl: Joi.string(),
  keywords: Joi.array()
    .items(Joi.string())
    .default([]),
  documentation: Joi.string(), // Valid HTML.
}).required()

function validateExample(example, index, ServiceClass) {
  const result = Joi.attempt(
    example,
    schema,
    `Example for ${ServiceClass.name} at index ${index}`
  )

  const { namedParams, pattern, staticPreview, previewUrl } = result

  if (staticPreview) {
    if (!pattern && !ServiceClass.route.pattern) {
      throw new Error(
        `Static preview for ${
          ServiceClass.name
        } at index ${index} does not declare a pattern`
      )
    } else if (!namedParams) {
      throw new Error(
        `Static preview for ${
          ServiceClass.name
        } at index ${index} does not declare namedParams`
      )
    }
    if (previewUrl) {
      throw new Error(
        `Static preview for ${
          ServiceClass.name
        } at index ${index} also declares a dynamic previewUrl, which is not allowed`
      )
    }
    if (pattern === ServiceClass.route.pattern) {
      throw new Error(
        `Example for ${
          ServiceClass.name
        } at index ${index} declares a redundant pattern which should be removed`
      )
    }

    // Make sure we can build the full URL using these patterns.
    try {
      pathToRegexp.compile(pattern || ServiceClass.route.pattern)(namedParams)
    } catch (e) {
      throw Error(
        `In example for ${
          ServiceClass.name
        } at index ${index}, ${e.message.toLowerCase()}`
      )
    }
    // Make sure there are no extra keys.
    let keys = []
    pathToRegexp(pattern || ServiceClass.route.pattern, keys)
    keys = keys.map(({ name }) => name)
    const extraKeys = Object.keys(namedParams).filter(k => !keys.includes(k))
    if (extraKeys.length) {
      throw Error(
        `In example for ${
          ServiceClass.name
        } at index ${index}, namedParams contains unknown keys: ${extraKeys.join(
          ', '
        )}`
      )
    }
  } else if (!previewUrl) {
    throw Error(
      `Example for ${
        ServiceClass.name
      } at index ${index} is missing required previewUrl or staticPreview`
    )
  }

  return result
}

function transformExample(inExample, index, ServiceClass) {
  const {
    // We should get rid of this transform, since the class name is never what
    // we want to see.
    title = ServiceClass.name,
    namedParams,
    queryParams,
    pattern,
    staticPreview,
    previewUrl,
    keywords,
    documentation,
  } = validateExample(inExample, index, ServiceClass)

  let example
  if (namedParams) {
    example = {
      pattern: ServiceClass._makeFullUrl(pattern || ServiceClass.route.pattern),
      namedParams,
      queryParams,
    }
  } else {
    example = {
      path: ServiceClass._makeFullUrl(previewUrl),
      queryParams,
    }
  }

  let preview
  if (staticPreview) {
    const {
      text: [label, message],
      color,
    } = ServiceClass._makeBadgeData({}, staticPreview)
    preview = { label, message: `${message}`, color }
  } else {
    preview = {
      path: ServiceClass._makeFullUrl(previewUrl),
      queryParams,
    }
  }

  return { title, example, preview, keywords, documentation }
}

module.exports = {
  validateExample,
  transformExample,
}
