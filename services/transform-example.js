'use strict'

const Joi = require('joi')

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
  exampleUrl: Joi.string(),
  keywords: Joi.array()
    .items(Joi.string())
    .default([]),
  documentation: Joi.string(), // Valid HTML.
})
  .rename('staticExample', 'staticPreview', { ignoreUndefined: true })
  .required()

function validateExample(example, index, ServiceClass) {
  const result = Joi.attempt(
    example,
    schema,
    `Example for ${ServiceClass.name} at index ${index}`
  )

  const { namedParams, pattern, staticPreview, previewUrl, exampleUrl } = result

  if (staticPreview) {
    if (!pattern && !ServiceClass.route.pattern) {
      throw new Error(
        `Static preview for ${
          ServiceClass.name
        } at index ${index} does not declare a pattern`
      )
    }
    if (namedParams && exampleUrl) {
      throw new Error(
        `Static preview for ${
          ServiceClass.name
        } at index ${index} declares both namedParams and exampleUrl`
      )
    } else if (!namedParams && !exampleUrl) {
      throw new Error(
        `Static preview for ${
          ServiceClass.name
        } at index ${index} does not declare namedParams nor exampleUrl`
      )
    }
    if (previewUrl) {
      throw new Error(
        `Static preview for ${
          ServiceClass.name
        } at index ${index} also declares a dynamic previewUrl, which is not allowed`
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
    exampleUrl,
    keywords,
    documentation,
  } = validateExample(inExample, index, ServiceClass)

  let example
  if (namedParams) {
    example = {
      pattern: ServiceClass._makeFullUrl(pattern),
      namedParams,
      queryParams,
    }
  } else {
    example = {
      path: ServiceClass._makeFullUrl(exampleUrl || previewUrl),
      queryParams,
    }
  }

  let preview
  if (staticPreview) {
    const badgeData = ServiceClass._makeBadgeData({}, staticPreview)
    preview = {
      label: badgeData.text[0],
      message: `${badgeData.text[1]}`,
      color: badgeData.colorscheme || badgeData.colorB,
    }
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
