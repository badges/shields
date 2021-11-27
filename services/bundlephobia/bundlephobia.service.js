import Joi from 'joi'
import prettyBytes from 'pretty-bytes'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  size: nonNegativeInteger,
  gzip: nonNegativeInteger,
}).required()

const keywords = ['node', 'bundlephobia']

export default class Bundlephobia extends BaseJsonService {
  static category = 'size'

  static route = {
    base: 'bundlephobia',
    pattern: ':format(min|minzip)/:scope(@[^/]+)?/:packageName/:version?',
  }

  static examples = [
    {
      title: 'npm bundle size',
      pattern: ':format(min|minzip)/:packageName',
      namedParams: {
        format: 'min',
        packageName: 'react',
      },
      staticPreview: this.render({ format: 'min', size: 6652 }),
      keywords,
    },
    {
      title: 'npm bundle size (scoped)',
      pattern: ':format(min|minzip)/:scope/:packageName',
      namedParams: {
        format: 'min',
        scope: '@cycle',
        packageName: 'core',
      },
      staticPreview: this.render({ format: 'min', size: 3562 }),
      keywords,
    },
    {
      title: 'npm bundle size (version)',
      pattern: ':format(min|minzip)/:packageName/:version',
      namedParams: {
        format: 'min',
        packageName: 'react',
        version: '15.0.0',
      },
      staticPreview: this.render({ format: 'min', size: 20535 }),
      keywords,
    },
    {
      title: 'npm bundle size (scoped version)',
      pattern: ':format(min|minzip)/:scope/:packageName/:version',
      namedParams: {
        format: 'min',
        scope: '@cycle',
        packageName: 'core',
        version: '7.0.0',
      },
      staticPreview: this.render({ format: 'min', size: 3562 }),
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'bundlephobia', color: 'informational' }

  static render({ format, size }) {
    const label = format === 'min' ? 'minified size' : 'minzipped size'
    return {
      label,
      message: prettyBytes(size),
    }
  }

  async fetch({ scope, packageName, version }) {
    const packageQuery = `${scope ? `${scope}/` : ''}${packageName}${
      version ? `@${version}` : ''
    }`
    const options = { searchParams: { package: packageQuery } }
    return this._requestJson({
      schema,
      url: 'https://bundlephobia.com/api/size',
      options,
      errorMessages: {
        404: 'package or version not found',
      },
    })
  }

  async handle({ format, scope, packageName, version }) {
    const json = await this.fetch({ scope, packageName, version })
    const size = format === 'min' ? json.size : json.gzip
    return this.constructor.render({ format, size })
  }
}
