import Joi from 'joi'
import { BaseJsonService, pathParam, queryParam } from '../index.js'
import { renderSizeBadge } from '../size.js'
import { nonNegativeInteger } from '../validators.js'

const schema = Joi.object({
  size: Joi.object({
    rawCompressedSize: nonNegativeInteger,
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  exports: Joi.string(),
}).required()

const esbuild =
  '<a href="https://github.com/evanw/esbuild" target="_blank" rel="noopener">esbuild</a>'
const denoflate =
  '<a href="https://github.com/hazae41/denoflate" target="_blank" rel="noopener">denoflate</a>'
const bundlejs =
  '<a href="https://bundlejs.com/" target="_blank" rel="noopener">bundlejs</a>'

const description = `
View ${esbuild} minified and ${denoflate} gzipped size of a javascript package or selected exports, via ${bundlejs}.
`

export default class BundlejsPackage extends BaseJsonService {
  static category = 'size'

  static route = {
    base: 'bundlejs/size',
    pattern: ':scope(@[^/]+)?/:packageName',
    queryParamSchema,
  }

  static openApi = {
    '/bundlejs/size/{packageName}': {
      get: {
        summary: 'npm package minimized gzipped size',
        description,
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'value-enhancer@3.1.2',
            description:
              'This can either be a package name e.g: `value-enhancer`, or a package name and version e.g: `value-enhancer@3.1.2`',
          }),
          queryParam({
            name: 'exports',
            example: 'isVal,val',
          }),
        ],
      },
    },
    '/bundlejs/size/{scope}/{packageName}': {
      get: {
        summary: 'npm package minimized gzipped size (scoped)',
        description,
        parameters: [
          pathParam({
            name: 'scope',
            example: '@ngneat',
          }),
          pathParam({
            name: 'packageName',
            example: 'falso@6.4.0',
            description:
              'This can either be a package name e.g: `falso`, or a package name and version e.g: `falso@6.4.0`',
          }),
          queryParam({
            name: 'exports',
            example: 'randEmail,randFullName',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'bundlejs', color: 'informational' }

  async fetch({ scope, packageName, exports }) {
    const searchParams = {
      q: `${scope ? `${scope}/` : ''}${packageName}`,
    }
    if (exports) {
      searchParams.treeshake = `[{${exports}}]`
    }
    return this._requestJson({
      schema,
      url: 'https://deno.bundlejs.com',
      options: {
        searchParams,
        timeout: {
          request: 3500,
        },
      },
      systemErrors: {
        ETIMEDOUT: { prettyMessage: 'timeout', cacheSeconds: 10 },
      },
      httpErrors: {
        404: 'package or version not found',
      },
    })
  }

  async handle({ scope, packageName }, { exports }) {
    const json = await this.fetch({ scope, packageName, exports })
    const size = json.size.rawCompressedSize
    return renderSizeBadge(size, 'metric', 'minified size (gzip)')
  }
}
