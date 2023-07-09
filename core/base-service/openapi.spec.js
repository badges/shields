import chai from 'chai'
import { category2openapi } from './openapi.js'
import BaseJsonService from './base-json.js'
const { expect } = chai

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

class LegacyService extends BaseJsonService {
  static category = 'build'
  static route = { base: 'legacy/service', pattern: ':packageName/:distTag*' }

  // this service defines an Examples Array
  static examples = [
    {
      title: 'LegacyService Title',
      namedParams: { packageName: 'badge-maker' },
      staticPreview: { label: 'build', message: 'passing' },
      documentation: 'LegacyService Description',
    },
    {
      title: 'LegacyService Title (with Tag)',
      namedParams: { packageName: 'badge-maker', distTag: 'latest' },
      staticPreview: { label: 'build', message: 'passing' },
      documentation: 'LegacyService Description (with Tag)',
    },
  ]
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
          'One of: flat (default), flat-square, plastic, for-the-badge, social',
        schema: { type: 'string' },
        example: 'flat',
      },
      logo: {
        name: 'logo',
        in: 'query',
        required: false,
        description:
          'One of the named logos (bitcoin, dependabot, gitlab, npm, paypal, serverfault, stackexchange, superuser, telegram, travis) or simple-icons. All simple-icons are referenced using icon slugs. You can click the icon title on <a href="https://simpleicons.org/" rel="noopener noreferrer" target="_blank">simple-icons</a> to copy the slug or they can be found in the <a href="https://github.com/simple-icons/simple-icons/blob/master/slugs.md">slugs.md file</a> in the simple-icons repository.',
        schema: { type: 'string' },
        example: 'appveyor',
      },
      logoColor: {
        name: 'logoColor',
        in: 'query',
        required: false,
        description:
          'The color of the logo (hex, rgb, rgba, hsl, hsla and css named colors supported). Supported for named logos and Shields logos but not for custom logos. For multicolor Shields logos, the corresponding named logo will be used and colored.',
        schema: { type: 'string' },
        example: 'violet',
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
            source: '.. image:: $url\n:   alt: OpenApiService Summary',
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
              '.. image:: $url\n:   alt: OpenApiService Summary (with Tag)',
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
    '/legacy/service/{packageName}/{distTag}': {
      get: {
        summary: 'LegacyService Title (with Tag)',
        description: 'LegacyService Description (with Tag)',
        parameters: [
          {
            name: 'packageName',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'badge-maker',
          },
          {
            name: 'distTag',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'latest',
          },
          { $ref: '#/components/parameters/style' },
          { $ref: '#/components/parameters/logo' },
          { $ref: '#/components/parameters/logoColor' },
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
            source: '![LegacyService Title (with Tag)]($url)',
          },
          {
            lang: 'reStructuredText',
            label: 'rSt',
            source: '.. image:: $url\n:   alt: LegacyService Title (with Tag)',
          },
          {
            lang: 'AsciiDoc',
            label: 'AsciiDoc',
            source: 'image:$url[LegacyService Title (with Tag)]',
          },
          {
            lang: 'HTML',
            label: 'HTML',
            source: '<img alt="LegacyService Title (with Tag)" src="$url">',
          },
        ],
      },
    },
    '/legacy/service/{packageName}': {
      get: {
        summary: 'LegacyService Title (with Tag)',
        description: 'LegacyService Description (with Tag)',
        parameters: [
          {
            name: 'packageName',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'badge-maker',
          },
          { $ref: '#/components/parameters/style' },
          { $ref: '#/components/parameters/logo' },
          { $ref: '#/components/parameters/logoColor' },
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
            source: '![LegacyService Title (with Tag)]($url)',
          },
          {
            lang: 'reStructuredText',
            label: 'rSt',
            source: '.. image:: $url\n:   alt: LegacyService Title (with Tag)',
          },
          {
            lang: 'AsciiDoc',
            label: 'AsciiDoc',
            source: 'image:$url[LegacyService Title (with Tag)]',
          },
          {
            lang: 'HTML',
            label: 'HTML',
            source: '<img alt="LegacyService Title (with Tag)" src="$url">',
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
        category2openapi({ name: 'build' }, [
          OpenApiService.getDefinition(),
          LegacyService.getDefinition(),
        ]),
      ),
    ).to.deep.equal(expected)
  })
})
