import { expect } from 'chai'
import {
  category2openapi,
  pathParam,
  pathParams,
  queryParam,
  queryParams,
} from './openapi.js'
import BaseJsonService from './base-json.js'

class OpenApiService extends BaseJsonService {
  static category = 'build'
  static route = { base: 'openapi/service', pattern: ':packageName/:distTag*' }

  // this service defines its own API Paths Object
  static openApi = {
    '/openapi/service/{packageName}': {
      get: {
        summary: 'OpenApiService Summary',
        description: 'OpenApiService Description',
        parameters: [
          {
            name: 'packageName',
            description: 'packageName description',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'badge-maker',
          },
        ],
      },
    },
    '/openapi/service/{packageName}/{distTag}': {
      get: {
        summary: 'OpenApiService Summary (with Tag)',
        description: 'OpenApiService Description (with Tag)',
        parameters: [
          {
            name: 'packageName',
            description: 'packageName description',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'badge-maker',
          },
          {
            name: 'distTag',
            description: 'distTag description',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'latest',
          },
        ],
      },
    },
  }
}

const expected = {
  openapi: '3.0.0',
  info: { version: '1.0.0', title: 'build', license: { name: 'CC0' } },
  components: {
    parameters: {
      style: {
        name: 'style',
        in: 'query',
        required: false,
        description:
          'If not specified, the default style for this badge is "flat".',
        schema: {
          enum: ['flat', 'flat-square', 'plastic', 'for-the-badge', 'social'],
          type: 'string',
        },
        example: 'flat',
      },
      logo: {
        name: 'logo',
        in: 'query',
        required: false,
        description:
          'Icon slug from simple-icons. You can click the icon title on <a href="https://simpleicons.org/" rel="noopener noreferrer" target="_blank">simple-icons</a> to copy the slug or they can be found in the <a href="https://github.com/simple-icons/simple-icons/blob/master/slugs.md">slugs.md file</a> in the simple-icons repository. <a href="/docs/logos">Further info</a>.',
        schema: { type: 'string' },
        example: 'appveyor',
      },
      logoColor: {
        name: 'logoColor',
        in: 'query',
        required: false,
        description:
          'The color of the logo (hex, rgb, rgba, hsl, hsla and css named colors supported). Supported for simple-icons logos but not for custom logos.',
        schema: { type: 'string' },
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
        schema: { type: 'string' },
        example: 'healthiness',
      },
      labelColor: {
        name: 'labelColor',
        in: 'query',
        required: false,
        description:
          'Background color of the left part (hex, rgb, rgba, hsl, hsla and css named colors supported).',
        schema: { type: 'string' },
        example: 'abcdef',
      },
      color: {
        name: 'color',
        in: 'query',
        required: false,
        description:
          'Background color of the right part (hex, rgb, rgba, hsl, hsla and css named colors supported).',
        schema: { type: 'string' },
        example: 'fedcba',
      },
      cacheSeconds: {
        name: 'cacheSeconds',
        in: 'query',
        required: false,
        description:
          'HTTP cache lifetime (rules are applied to infer a default value on a per-badge basis, any values specified below the default will be ignored).',
        schema: { type: 'string' },
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
        schema: { type: 'array', maxItems: 2, items: { type: 'string' } },
      },
    },
  },
  paths: {
    '/openapi/service/{packageName}': {
      get: {
        summary: 'OpenApiService Summary',
        description: 'OpenApiService Description',
        parameters: [
          {
            name: 'packageName',
            description: 'packageName description',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'badge-maker',
          },
          { $ref: '#/components/parameters/style' },
          { $ref: '#/components/parameters/logo' },
          { $ref: '#/components/parameters/logoColor' },
          { $ref: '#/components/parameters/logoSize' },
          { $ref: '#/components/parameters/label' },
          { $ref: '#/components/parameters/labelColor' },
          { $ref: '#/components/parameters/color' },
          { $ref: '#/components/parameters/cacheSeconds' },
          { $ref: '#/components/parameters/link' },
        ],
        'x-code-samples': [
          { lang: 'URL', label: 'URL', source: '$url' },
          {
            lang: 'Markdown',
            label: 'Markdown',
            source: '![OpenApiService Summary]($url)',
          },
          {
            lang: 'reStructuredText',
            label: 'rSt',
            source: '.. image:: $url\n   :alt: OpenApiService Summary',
          },
          {
            lang: 'AsciiDoc',
            label: 'AsciiDoc',
            source: 'image:$url[OpenApiService Summary]',
          },
          {
            lang: 'HTML',
            label: 'HTML',
            source: '<img alt="OpenApiService Summary" src="$url">',
          },
        ],
      },
    },
    '/openapi/service/{packageName}/{distTag}': {
      get: {
        summary: 'OpenApiService Summary (with Tag)',
        description: 'OpenApiService Description (with Tag)',
        parameters: [
          {
            name: 'packageName',
            description: 'packageName description',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'badge-maker',
          },
          {
            name: 'distTag',
            description: 'distTag description',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'latest',
          },
          { $ref: '#/components/parameters/style' },
          { $ref: '#/components/parameters/logo' },
          { $ref: '#/components/parameters/logoColor' },
          { $ref: '#/components/parameters/logoSize' },
          { $ref: '#/components/parameters/label' },
          { $ref: '#/components/parameters/labelColor' },
          { $ref: '#/components/parameters/color' },
          { $ref: '#/components/parameters/cacheSeconds' },
          { $ref: '#/components/parameters/link' },
        ],
        'x-code-samples': [
          { lang: 'URL', label: 'URL', source: '$url' },
          {
            lang: 'Markdown',
            label: 'Markdown',
            source: '![OpenApiService Summary (with Tag)]($url)',
          },
          {
            lang: 'reStructuredText',
            label: 'rSt',
            source:
              '.. image:: $url\n   :alt: OpenApiService Summary (with Tag)',
          },
          {
            lang: 'AsciiDoc',
            label: 'AsciiDoc',
            source: 'image:$url[OpenApiService Summary (with Tag)]',
          },
          {
            lang: 'HTML',
            label: 'HTML',
            source: '<img alt="OpenApiService Summary (with Tag)" src="$url">',
          },
        ],
      },
    },
  },
}

function clean(obj) {
  // remove any undefined values in the object
  return JSON.parse(JSON.stringify(obj))
}

describe('category2openapi', function () {
  it('generates an Open API spec', function () {
    expect(
      clean(
        category2openapi({
          category: { name: 'build' },
          services: [OpenApiService.getDefinition()],
        }),
      ),
    ).to.deep.equal(expected)
  })
})

describe('pathParam, pathParams', function () {
  it('generates a pathParam with defaults', function () {
    const input = { name: 'name', example: 'example' }
    const expected = {
      name: 'name',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
      },
      example: 'example',
      description: undefined,
    }
    expect(pathParam(input)).to.deep.equal(expected)
    expect(pathParams(input)[0]).to.deep.equal(expected)
  })

  it('generates a pathParam with custom args', function () {
    const input = {
      name: 'name',
      example: true,
      schema: { type: 'boolean' },
      description: 'long desc',
    }
    const expected = {
      name: 'name',
      in: 'path',
      required: true,
      schema: {
        type: 'boolean',
      },
      example: true,
      description: 'long desc',
    }
    expect(pathParam(input)).to.deep.equal(expected)
    expect(pathParams(input)[0]).to.deep.equal(expected)
  })

  it('generates multiple pathParams', function () {
    expect(
      pathParams(
        { name: 'name1', example: 'example1' },
        { name: 'name2', example: 'example2' },
      ),
    ).to.deep.equal([
      {
        name: 'name1',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
        },
        example: 'example1',
        description: undefined,
      },
      {
        name: 'name2',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
        },
        example: 'example2',
        description: undefined,
      },
    ])
  })
})

describe('queryParam, queryParams', function () {
  it('generates a queryParam with defaults', function () {
    const input = { name: 'name', example: 'example' }
    const expected = {
      name: 'name',
      in: 'query',
      required: false,
      schema: { type: 'string' },
      example: 'example',
      description: undefined,
    }
    expect(queryParam(input)).to.deep.equal(expected)
    expect(queryParams(input)[0]).to.deep.equal(expected)
  })

  it('generates queryParam with custom args', function () {
    const input = {
      name: 'name',
      example: 'example',
      required: true,
      description: 'long desc',
    }
    const expected = {
      name: 'name',
      in: 'query',
      required: true,
      schema: { type: 'string' },
      example: 'example',
      description: 'long desc',
    }
    expect(queryParam(input)).to.deep.equal(expected)
    expect(queryParams(input)[0]).to.deep.equal(expected)
  })

  it('generates a queryParam with boolean/null example', function () {
    const input = { name: 'name', example: null, schema: { type: 'boolean' } }
    const expected = {
      name: 'name',
      in: 'query',
      required: false,
      schema: { type: 'boolean' },
      allowEmptyValue: true,
      example: null,
      description: undefined,
    }
    expect(queryParam(input)).to.deep.equal(expected)
    expect(queryParams(input)[0]).to.deep.equal(expected)
  })

  it('generates multiple queryParams', function () {
    expect(
      queryParams(
        { name: 'name1', example: 'example1' },
        { name: 'name2', example: 'example2' },
      ),
    ).to.deep.equal([
      {
        name: 'name1',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        example: 'example1',
        description: undefined,
      },
      {
        name: 'name2',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        example: 'example2',
        description: undefined,
      },
    ])
  })
})
