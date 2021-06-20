import Joi from 'joi'
import { pathToRegexp, compile } from 'path-to-regexp'
import categories from '../../services/categories.js'
import coalesceBadge from './coalesce-badge.js'
import { makeFullUrl } from './route.js'

const optionalObjectOfKeyValues = Joi.object().pattern(
  /./,
  Joi.string().allow(null)
)

const schema = Joi.object({
  // This should be:
  // title: Joi.string().required(),
  title: Joi.string(),
  namedParams: optionalObjectOfKeyValues.required(),
  queryParams: optionalObjectOfKeyValues.default({}),
  pattern: Joi.string(),
  staticPreview: Joi.object({
    label: Joi.string(),
    message: Joi.alternatives()
      .try(Joi.string().allow('').required(), Joi.number())
      .required(),
    color: Joi.string(),
    style: Joi.string(),
  }).required(),
  keywords: Joi.array().items(Joi.string()).default([]),
  documentation: Joi.string(), // Valid HTML.
}).required()

function validateExample(example, index, ServiceClass) {
  const result = Joi.attempt(
    example,
    schema,
    `Example for ${ServiceClass.name} at index ${index}`
  )

  const { pattern, namedParams } = result

  if (!pattern && !ServiceClass.route.pattern) {
    throw new Error(
      `Example for ${ServiceClass.name} at index ${index} does not declare a pattern`
    )
  }
  if (pattern === ServiceClass.route.pattern) {
    throw new Error(
      `Example for ${ServiceClass.name} at index ${index} declares a redundant pattern which should be removed`
    )
  }

  // Make sure we can build the full URL using these patterns.
  try {
    compile(pattern || ServiceClass.route.pattern, {
      encode: encodeURIComponent,
    })(namedParams)
  } catch (e) {
    throw Error(
      `In example for ${
        ServiceClass.name
      } at index ${index}, ${e.message.toLowerCase()}`
    )
  }
  // Make sure there are no extra keys.
  let keys = []
  pathToRegexp(pattern || ServiceClass.route.pattern, keys, {
    strict: true,
    sensitive: true,
  })
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

  if (example.keywords) {
    // Make sure the keywords are at least two characters long.
    const tinyKeywords = example.keywords.filter(k => k.length < 2)
    if (tinyKeywords.length) {
      throw Error(
        `In example for ${
          ServiceClass.name
        } at index ${index}, keywords contains words that are less than two characters long: ${tinyKeywords.join(
          ', '
        )}`
      )
    }
    // Make sure none of the keywords are already included in the title.
    const title = (example.title || ServiceClass.name).toLowerCase()
    const redundantKeywords = example.keywords.filter(k =>
      title.includes(k.toLowerCase())
    )
    if (redundantKeywords.length) {
      throw Error(
        `In example for ${
          ServiceClass.name
        } at index ${index}, keywords contains words that are already in the title: ${redundantKeywords.join(
          ', '
        )}`
      )
    }
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
    keywords,
    documentation,
  } = validateExample(inExample, index, ServiceClass)

  const { label, message, color, style, namedLogo } = coalesceBadge(
    {},
    staticPreview,
    ServiceClass.defaultBadgeData,
    ServiceClass
  )

  return {
    title,
    example: {
      pattern: makeFullUrl(
        ServiceClass.route.base,
        pattern || ServiceClass.route.pattern
      ),
      namedParams,
      queryParams,
    },
    preview: {
      label,
      message: `${message}`,
      color,
      style: style === 'flat' ? undefined : style,
      namedLogo,
    },
    keywords: keywords.concat(
      categories.find(c => c.id === ServiceClass.category).keywords
    ),
    documentation: documentation ? { __html: documentation } : undefined,
  }
}

export { validateExample, transformExample }
