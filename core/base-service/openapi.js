/**
 * Functions for publishing the shields.io URL schema as an OpenAPI Document
 *
 * @module
 */

const baseUrl = process.env.BASE_URL
const globalParamRefs = [
  { $ref: '#/components/parameters/style' },
  { $ref: '#/components/parameters/logo' },
  { $ref: '#/components/parameters/logoColor' },
  { $ref: '#/components/parameters/logoSize' },
  { $ref: '#/components/parameters/label' },
  { $ref: '#/components/parameters/labelColor' },
  { $ref: '#/components/parameters/color' },
  { $ref: '#/components/parameters/cacheSeconds' },
  { $ref: '#/components/parameters/link' },
]

function getCodeSamples(altText) {
  return [
    {
      lang: 'URL',
      label: 'URL',
      source: '$url',
    },
    {
      lang: 'Markdown',
      label: 'Markdown',
      source: `![${altText}]($url)`,
    },
    {
      lang: 'reStructuredText',
      label: 'rSt',
      source: `.. image:: $url\n   :alt: ${altText}`,
    },
    {
      lang: 'AsciiDoc',
      label: 'AsciiDoc',
      source: `image:$url[${altText}]`,
    },
    {
      lang: 'HTML',
      label: 'HTML',
      source: `<img alt="${altText}" src="$url">`,
    },
  ]
}

function getEnum(pattern, paramName) {
  const re = new RegExp(`${paramName}\\(([A-Za-z0-9_\\-|]+)\\)`)
  const match = pattern.match(re)
  if (match === null) {
    return undefined
  }
  if (!match[1].includes('|')) {
    return undefined
  }
  return match[1].split('|')
}

function addGlobalProperties(endpoints) {
  const paths = {}
  for (const key of Object.keys(endpoints)) {
    paths[key] = endpoints[key]
    paths[key].get.parameters = [
      ...paths[key].get.parameters,
      ...globalParamRefs,
    ]
    paths[key].get['x-code-samples'] = getCodeSamples(paths[key].get.summary)
  }
  return paths
}

function sortPaths(obj) {
  const entries = Object.entries(obj)
  entries.sort((a, b) => a[1].get.summary.localeCompare(b[1].get.summary))
  return Object.fromEntries(entries)
}

function services2openapi(services, sort) {
  const paths = {}
  for (const service of services) {
    for (const [key, value] of Object.entries(
      addGlobalProperties(service.openApi),
    )) {
      if (key in paths) {
        throw new Error(`Conflicting route: ${key}`)
      }
      paths[key] = value
    }
  }
  return sort ? sortPaths(paths) : paths
}

function category2openapi({ category, services, sort = false }) {
  const spec = {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: category.name,
      license: {
        name: 'CC0',
      },
    },
    servers: baseUrl ? [{ url: baseUrl }] : undefined,
    components: {
      parameters: {
        style: {
          name: 'style',
          in: 'query',
          required: false,
          description: `If not specified, the default style for this badge is "${
            category.name.toLowerCase() === 'social' ? 'social' : 'flat'
          }".`,
          schema: {
            type: 'string',
            enum: ['flat', 'flat-square', 'plastic', 'for-the-badge', 'social'],
          },
          example: 'flat',
        },
        logo: {
          name: 'logo',
          in: 'query',
          required: false,
          description:
            'Icon slug from simple-icons. You can click the icon title on <a href="https://simpleicons.org/" rel="noopener noreferrer" target="_blank">simple-icons</a> to copy the slug or they can be found in the <a href="https://github.com/simple-icons/simple-icons/blob/master/slugs.md">slugs.md file</a> in the simple-icons repository. <a href="/docs/logos">Further info</a>.',
          schema: {
            type: 'string',
          },
          example: 'appveyor',
        },
        logoColor: {
          name: 'logoColor',
          in: 'query',
          required: false,
          description:
            'The color of the logo (hex, rgb, rgba, hsl, hsla and css named colors supported). Supported for simple-icons logos but not for custom logos.',
          schema: {
            type: 'string',
          },
          example: 'violet',
        },
        logoSize: {
          name: 'logoSize',
          in: 'query',
          required: false,
          description:
            'Make icons adaptively resize by setting `auto`. Useful for some wider logos like `amd` and `amg`. Supported for simple-icons logos but not for custom logos.',
          schema: {
            type: 'string',
          },
          example: 'auto',
        },
        label: {
          name: 'label',
          in: 'query',
          required: false,
          description:
            'Override the default left-hand-side text (<a href="https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding">URL-Encoding</a> needed for spaces or special characters!)',
          schema: {
            type: 'string',
          },
          example: 'healthiness',
        },
        labelColor: {
          name: 'labelColor',
          in: 'query',
          required: false,
          description:
            'Background color of the left part (hex, rgb, rgba, hsl, hsla and css named colors supported).',
          schema: {
            type: 'string',
          },
          example: 'abcdef',
        },
        color: {
          name: 'color',
          in: 'query',
          required: false,
          description:
            'Background color of the right part (hex, rgb, rgba, hsl, hsla and css named colors supported).',
          schema: {
            type: 'string',
          },
          example: 'fedcba',
        },
        cacheSeconds: {
          name: 'cacheSeconds',
          in: 'query',
          required: false,
          description:
            'HTTP cache lifetime (rules are applied to infer a default value on a per-badge basis, any values specified below the default will be ignored).',
          schema: {
            type: 'string',
          },
          example: '3600',
        },
        link: {
          name: 'link',
          in: 'query',
          required: false,
          description:
            'Specify what clicking on the left/right of a badge should do. Note that this only works when integrating your badge in an `<object>` HTML tag, but not an `<img>` tag or a markup language.',
          style: 'form',
          explode: true,
          schema: {
            type: 'array',
            maxItems: 2,
            items: {
              type: 'string',
            },
          },
        },
      },
    },
    paths: services2openapi(services, sort),
  }

  return spec
}

/**
 * Helper function for assembling an OpenAPI path parameter object
 *
 * @param {module:core/base-service/openapi~PathParamInput} param Input param
 * @returns {module:core/base-service/openapi~OpenApiParam} OpenAPI Parameter Object
 * @see https://swagger.io/specification/#parameter-object
 */
function pathParam({
  name,
  example,
  schema = { type: 'string' },
  description,
}) {
  return { name, in: 'path', required: true, schema, example, description }
}

/**
 * Helper function for assembling an array of OpenAPI path parameter objects
 * The code
 * ```
 * const params = pathParams(
 *   { name: 'name1', example: 'example1' },
 *   { name: 'name2', example: 'example2' },
 * )
 * ```
 * is equivalent to
 * ```
 * const params = [
 *   pathParam({ name: 'name1', example: 'example1' }),
 *   pathParam({ name: 'name2', example: 'example2' }),
 * ]
 * ```
 *
 * @param {...module:core/base-service/openapi~PathParamInput} params Input params
 * @returns {Array.<module:core/base-service/openapi~OpenApiParam>} Array of OpenAPI Parameter Objects
 * @see {@link module:core/base-service/openapi~pathParam}
 */
function pathParams(...params) {
  return params.map(param => pathParam(param))
}

/**
 * Helper function for assembling an OpenAPI query parameter object
 *
 * @param {module:core/base-service/openapi~QueryParamInput} param Input param
 * @returns {module:core/base-service/openapi~OpenApiParam} OpenAPI Parameter Object
 * @see https://swagger.io/specification/#parameter-object
 */
function queryParam({
  name,
  example,
  schema = { type: 'string' },
  required = false,
  description,
}) {
  const param = { name, in: 'query', required, schema, example, description }
  if (example === null && schema.type === 'boolean') {
    param.allowEmptyValue = true
  }
  return param
}

/**
 * Helper function for assembling an array of OpenAPI query parameter objects
 * The code
 * ```
 * const params = queryParams(
 *   { name: 'name1', example: 'example1' },
 *   { name: 'name2', example: 'example2' },
 * )
 * ```
 * is equivalent to
 * ```
 * const params = [
 *   queryParam({ name: 'name1', example: 'example1' }),
 *   queryParam({ name: 'name2', example: 'example2' }),
 * ]
 * ```
 *
 * @param {...module:core/base-service/openapi~QueryParamInput} params Input params
 * @returns {Array.<module:core/base-service/openapi~OpenApiParam>} Array of OpenAPI Parameter Objects
 * @see {@link module:core/base-service/openapi~queryParam}
 */
function queryParams(...params) {
  return params.map(param => queryParam(param))
}

/**
 * @typedef {object} PathParamInput
 * @property {string} name The name of the parameter. Parameter names are case sensitive
 * @property {string} example Example of a valid value for this parameter
 * @property {object} [schema={ type: 'string' }] Parameter schema.
 *    An [OpenAPI Schema object](https://swagger.io/specification/#schema-object)
 *    specifying the parameter type.
 *    Normally this should be omitted as all path parameters are strings.
 *    Use this when we also want to pass an enum of valid parameters
 *    to be presented as a drop-down in the frontend. e.g:
 *    `{'type': 'string', 'enum': ['github', 'bitbucket'}` (Optional)
 * @property {string} description A brief description of the parameter (Optional)
 */

/**
 * @typedef {object} QueryParamInput
 * @property {string} name The name of the parameter. Parameter names are case sensitive
 * @property {string|null} example Example of a valid value for this parameter
 * @property {object} [schema={ type: 'string' }] Parameter schema.
 *    An [OpenAPI Schema object](https://swagger.io/specification/#schema-object)
 *    specifying the parameter type. This can normally be omitted.
 *    Query params are usually strings. (Optional)
 * @property {boolean} [required=false] Determines whether this parameter is mandatory (Optional)
 * @property {string} description A brief description of the parameter (Optional)
 */

/**
 * OpenAPI Parameter Object
 *
 * @typedef {object} OpenApiParam
 * @property {string} name The name of the parameter
 * @property {string|null} example Example of a valid value for this parameter
 * @property {('path'|'query')} in The location of the parameter
 * @property {object} schema Parameter schema.
 *    An [OpenAPI Schema object](https://swagger.io/specification/#schema-object)
 *    specifying the parameter type.
 * @property {boolean} required Determines whether this parameter is mandatory
 * @property {string} description A brief description of the parameter
 * @property {boolean} allowEmptyValue If true, allows the ability to pass an empty value to this parameter
 */

export {
  category2openapi,
  getEnum,
  pathParam,
  pathParams,
  queryParam,
  queryParams,
}
