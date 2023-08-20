import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  size: Joi.object({
    compressedSize: Joi.string().required(),
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  exports: Joi.string(),
}).required()

const keywords = ['node', 'bundlejs']

const esbuild =
  '<a href="https://github.com/evanw/esbuild" target="_blank" rel="noopener">esbuild</a>'
const denoflate =
  '<a href="https://github.com/hazae41/denoflate" target="_blank" rel="noopener">denoflate</a>'
const bundlejs =
  '<a href="https://bundlejs.com/" target="_blank" rel="noopener">bundlejs</a>'

const documentation = `
<p>
 View ${esbuild} minified and ${denoflate} gzipped size of a package or selected exports, via ${bundlejs}.
</p>
`

export default class BundlejsPackage extends BaseJsonService {
  static category = 'size'

  static route = {
    base: 'bundlejs/size',
    pattern: ':scope(@[^/]+)?/:packageName',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'npm package minimized gzipped size',
      pattern: ':packageName',
      namedParams: {
        packageName: 'react',
      },
      staticPreview: this.render({ size: '2.94 kB' }),
      keywords,
      documentation,
    },
    {
      title: 'npm package minimized gzipped size (version)',
      pattern: ':packageName',
      namedParams: {
        packageName: 'react@18.2.0',
      },
      staticPreview: this.render({ size: '2.94 kB' }),
      keywords,
      documentation,
    },
    {
      title: 'npm package minimized gzipped size (scoped)',
      pattern: ':scope/:packageName',
      namedParams: {
        scope: '@cycle',
        packageName: 'rx-run',
      },
      staticPreview: this.render({ size: '32.3 kB' }),
      keywords,
      documentation,
    },
    {
      title: 'npm package minimized gzipped size (select exports)',
      pattern: ':packageName',
      namedParams: {
        packageName: 'value-enhancer',
      },
      queryParams: {
        exports: 'isVal,val',
      },
      staticPreview: this.render({ size: '823 B' }),
      keywords,
      documentation,
    },
    {
      title:
        'npm package minimized gzipped size (scoped version select exports)',
      pattern: ':scope/:packageName',
      namedParams: {
        scope: '@ngneat',
        packageName: 'falso@6.4.0',
      },
      queryParams: {
        exports: 'randEmail,randFullName',
      },
      staticPreview: this.render({ size: '17.8 kB' }),
      keywords,
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'bundlejs', color: 'informational' }

  static render({ size }) {
    return {
      label: 'minified size (gzip)',
      message: size,
    }
  }

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
    const size = json.size.compressedSize
    return this.constructor.render({ size })
  }
}
