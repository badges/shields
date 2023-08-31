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

function pattern2openapi(pattern) {
  return pattern
    .replace(/:([A-Za-z0-9_\-.]+)(?=[/]?)/g, (matches, grp1) => `{${grp1}}`)
    .replace(/\([^)]*\)/g, '')
    .replace(/\+$/, '')
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

function param2openapi(pattern, paramName, exampleValue, paramType) {
  const outParam = {}
  outParam.name = paramName
  // We don't have description if we are building the OpenAPI spec from examples[]
  outParam.in = paramType
  if (paramType === 'path') {
    outParam.required = true
  } else {
    /* Occasionally we do have required query params, but we can't
    detect this if we are building the OpenAPI spec from examples[]
    so just assume all query params are optional */
    outParam.required = false
  }

  if (exampleValue === null && paramType === 'query') {
    outParam.schema = { type: 'boolean' }
    outParam.allowEmptyValue = true
  } else {
    outParam.schema = { type: 'string' }
  }

  if (paramType === 'path') {
    outParam.schema.enum = getEnum(pattern, paramName)
  }

  outParam.example = exampleValue
  return outParam
}

function getVariants(pattern) {
  /*
  given a URL pattern (which may include '/one/or/:more?/:optional/:parameters*')
  return an array of all possible permutations:
  [
    '/one/or/:more/:optional/:parameters',
    '/one/or/:optional/:parameters',
    '/one/or/:more/:optional',
    '/one/or/:optional',
  ]
  */
  const patterns = [pattern.split('/')]
  while (patterns.flat().find(p => p.endsWith('?') || p.endsWith('*'))) {
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i]
      for (let j = 0; j < pattern.length; j++) {
        const path = pattern[j]
        if (path.endsWith('?') || path.endsWith('*')) {
          pattern[j] = path.slice(0, -1)
          patterns.push(patterns[i].filter(p => p !== pattern[j]))
        }
      }
    }
  }
  for (let i = 0; i < patterns.length; i++) {
    patterns[i] = patterns[i].join('/')
  }
  return patterns
}

function examples2openapi(examples) {
  const paths = {}
  for (const example of examples) {
    const patterns = getVariants(example.example.pattern)

    for (const pattern of patterns) {
      const openApiPattern = pattern2openapi(pattern)
      if (
        openApiPattern.includes('*') ||
        openApiPattern.includes('?') ||
        openApiPattern.includes('+') ||
        openApiPattern.includes('(')
      ) {
        throw new Error(`unexpected characters in pattern '${openApiPattern}'`)
      }

      /*
      There's several things going on in this block:
      1. Filter out any examples for params that don't appear
         in this variant of the route
      2. Make sure we add params to the array
         in the same order they appear in the route
      3. If there are any params we don't have an example value for,
         make sure they still appear in the pathParams array with
         exampleValue == undefined anyway
      */
      const pathParams = []
      for (const param of openApiPattern
        .split('/')
        .filter(p => p.startsWith('{') && p.endsWith('}'))) {
        const paramName = param.slice(1, -1)
        const exampleValue = example.example.namedParams[paramName]
        pathParams.push(param2openapi(pattern, paramName, exampleValue, 'path'))
      }

      const queryParams = example.example.queryParams || {}

      const parameters = [
        ...pathParams,
        ...Object.entries(queryParams).map(([paramName, exampleValue]) =>
          param2openapi(pattern, paramName, exampleValue, 'query'),
        ),
        ...globalParamRefs,
      ]
      paths[openApiPattern] = {
        get: {
          summary: example.title,
          description: example?.documentation?.__html
            .replace(/<br>/g, '<br />') // react does not like <br>
            .replace(/{/g, '&#123;')
            .replace(/}/g, '&#125;')
            .replace(/<style>(.|\n)*?<\/style>/, ''), // workaround for w3c-validation TODO: remove later
          parameters,
          'x-code-samples': getCodeSamples(example.title),
        },
      }
    }
  }
  return paths
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

function services2openapi(services) {
  const paths = {}
  for (const service of services) {
    if (service.openApi) {
      // if the service declares its own OpenAPI definition, use that...
      for (const [key, value] of Object.entries(
        addGlobalProperties(service.openApi),
      )) {
        if (key in paths) {
          throw new Error(`Conflicting route: ${key}`)
        }
        paths[key] = value
      }
    } else {
      // ...otherwise do our best to build one from examples[]
      for (const [key, value] of Object.entries(
        examples2openapi(service.examples),
      )) {
        // allow conflicting routes for legacy examples
        paths[key] = value
      }
    }
  }
  return paths
}

function category2openapi(category, services) {
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
          description:
            'One of: flat (default), flat-square, plastic, for-the-badge, social',
          schema: {
            type: 'string',
          },
          example: 'flat',
        },
        logo: {
          name: 'logo',
          in: 'query',
          required: false,
          description:
            'One of the named logos (bitcoin, dependabot, gitlab, npm, paypal, serverfault, stackexchange, superuser, telegram, travis) or simple-icons. All simple-icons are referenced using icon slugs. You can click the icon title on <a href="https://simpleicons.org/" rel="noopener noreferrer" target="_blank">simple-icons</a> to copy the slug or they can be found in the <a href="https://github.com/simple-icons/simple-icons/blob/master/slugs.md">slugs.md file</a> in the simple-icons repository. <a href="/docs/logos">Further info</a>.',
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
            'The color of the logo (hex, rgb, rgba, hsl, hsla and css named colors supported). Supported for named logos and Shields logos but not for custom logos. For multicolor Shields logos, the corresponding named logo will be used and colored.',
          schema: {
            type: 'string',
          },
          example: 'violet',
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
    paths: services2openapi(services),
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
 * is equivilent to
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
 * is equivilent to
 * ```
 * const params = [
 *   queryParam({ name: 'name1', example: 'example1' }),
 *   queryParams({ name: 'name2', example: 'example2' }),
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

export { category2openapi, pathParam, pathParams, queryParam, queryParams }
