import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { collectDefinitions } from '../core/base-service/loader.js'

const baseUrl = process.env.BASE_URL || 'https://img.shields.io'
const specsPath = path.join('frontend', 'categories')

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
      source: `.. image:: $url\n:   alt: ${altText}`,
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
  // TODO: outParam.description we don't store this yet
  outParam.in = paramType
  if (paramType === 'path') {
    outParam.required = true
  } else {
    /*
    Occasionally we do have required query params,
    but at the moment we can't pick this up.

    TODO: Add something to the example format which allows
    us to populate this based on the queryParamSchema.
    */
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

function services2openapi(services) {
  const paths = {}
  for (const service of services) {
    for (const example of service.examples) {
      const patterns = getVariants(example.example.pattern)

      for (const pattern of patterns) {
        const openApiPattern = pattern2openapi(pattern)
        if (
          openApiPattern.includes('*') ||
          openApiPattern.includes('?') ||
          openApiPattern.includes('+') ||
          openApiPattern.includes('(')
        ) {
          throw new Error(
            `unexpected characters in pattern '${openApiPattern}'`
          )
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
          pathParams.push(
            param2openapi(pattern, paramName, exampleValue, 'path')
          )
        }

        const queryParams = example.example.queryParams || {}

        const parameters = [
          ...pathParams,
          ...Object.entries(queryParams).map(([paramName, exampleValue]) =>
            param2openapi(pattern, paramName, exampleValue, 'query')
          ),
          { $ref: '#/components/parameters/style' },
          { $ref: '#/components/parameters/logo' },
          { $ref: '#/components/parameters/logoColor' },
          { $ref: '#/components/parameters/label' },
          { $ref: '#/components/parameters/labelColor' },
          { $ref: '#/components/parameters/color' },
          { $ref: '#/components/parameters/cacheSeconds' },
          { $ref: '#/components/parameters/link' },
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
    servers: [{ url: baseUrl }],
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
            'Insert one of the named logos (bitcoin, dependabot, gitlab, npm, paypal, serverfault, stackexchange, superuser, telegram, travis) or <a href="https://simpleicons.org/" rel="noopener noreferrer" target="_blank">simple-icons</a>. Simple-icons are referenced using icon slugs which can be found on the simple-icons site or in the <a href="https://github.com/simple-icons/simple-icons/blob/develop/slugs.md" rel="noopener noreferrer" target="_blank">slugs.md</a> file in the simple-icons repository.',
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
            'Set the color of the logo (hex, rgb, rgba, hsl, hsla and css named colors supported). Supported for named logos and Shields logos but not for custom logos. For multicolor Shields logos, the corresponding named logo will be used and colored.',
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
            'Set background of the left part (hex, rgb, rgba, hsl, hsla and css named colors supported). The legacy name "colorA" is also supported.',
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
            'Set background of the right part (hex, rgb, rgba, hsl, hsla and css named colors supported). The legacy name "colorB" is also supported.',
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
            'Set the HTTP cache lifetime (rules are applied to infer a default value on a per-badge basis, any values specified below the default will be ignored). The legacy name "maxAge" is also supported.',
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

function writeSpec(filename, spec) {
  // Omit undefined
  // https://github.com/nodeca/js-yaml/issues/356#issuecomment-312430599
  const cleaned = JSON.parse(JSON.stringify(spec))

  fs.writeFileSync(
    filename,
    yaml.dump(cleaned, { flowLevel: 5, forceQuotes: true })
  )
}

;(async () => {
  const definitions = await collectDefinitions()

  for (const category of definitions.categories) {
    const services = definitions.services.filter(
      service => service.category === category.id && !service.isDeprecated
    )

    writeSpec(
      path.join(specsPath, `${category.id}.yaml`),
      category2openapi(category, services)
    )
  }

  let coreServices = []
  coreServices = coreServices.concat(
    definitions.services.filter(
      service => service.category === 'static' && !service.isDeprecated
    )
  )
  coreServices = coreServices.concat(
    definitions.services.filter(
      service => service.category === 'dynamic' && !service.isDeprecated
    )
  )
  writeSpec(
    path.join(specsPath, '1core.yaml'),
    category2openapi({ name: 'Core' }, coreServices)
  )
})()
