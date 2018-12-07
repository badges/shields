'use strict'

module.exports = function validateExample(
  {
    title,
    query,
    queryParams,
    namedParams,
    exampleUrl,
    previewUrl,
    pattern,
    urlPattern,
    staticExample,
    staticPreview,
    documentation,
    keywords,
  },
  index,
  ServiceClass
) {
  pattern = pattern || urlPattern || ServiceClass.route.pattern
  staticExample = staticExample || staticPreview
  query = query || queryParams

  if (staticExample) {
    if (!pattern) {
      throw new Error(
        `Static example for ${
          ServiceClass.name
        } at index ${index} does not declare a pattern`
      )
    }
    if (namedParams && exampleUrl) {
      throw new Error(
        `Static example for ${
          ServiceClass.name
        } at index ${index} declares both namedParams and exampleUrl`
      )
    } else if (!namedParams && !exampleUrl) {
      throw new Error(
        `Static example for ${
          ServiceClass.name
        } at index ${index} does not declare namedParams nor exampleUrl`
      )
    }
    if (previewUrl) {
      throw new Error(
        `Static example for ${
          ServiceClass.name
        } at index ${index} also declares a dynamic previewUrl, which is not allowed`
      )
    }
  } else if (!previewUrl) {
    throw Error(
      `Example for ${
        ServiceClass.name
      } at index ${index} is missing required previewUrl or staticExample`
    )
  }

  return {
    title,
    query,
    namedParams,
    exampleUrl,
    previewUrl,
    pattern,
    staticExample,
    documentation,
    keywords,
  }
}
