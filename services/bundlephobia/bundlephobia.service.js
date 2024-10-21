import Joi from 'joi'
import { renderSizeBadge, unitsQueryParam, unitsOpenApiParam } from '../size.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParam } from '../index.js'

const defaultUnits = 'IEC'

const schema = Joi.object({
  size: nonNegativeInteger,
  gzip: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  units: unitsQueryParam.default(defaultUnits),
}).required()

const description =
  '[Bundlephobia](https://bundlephobia.com) lets you understand the size of a javascript package from NPM before it becomes a part of your bundle.'

export default class Bundlephobia extends BaseJsonService {
  static category = 'size'

  static route = {
    base: 'bundlephobia',
    pattern: ':format(min|minzip)/:scope(@[^/]+)?/:packageName/:version?',
    queryParamSchema,
  }

  static openApi = {
    '/bundlephobia/{format}/{packageName}': {
      get: {
        summary: 'npm bundle size',
        description,
        parameters: [
          pathParam({
            name: 'format',
            schema: { type: 'string', enum: this.getEnum('format') },
            example: 'min',
          }),
          pathParam({
            name: 'packageName',
            example: 'react',
          }),
          unitsOpenApiParam(defaultUnits),
        ],
      },
    },
    '/bundlephobia/{format}/{scope}/{packageName}': {
      get: {
        summary: 'npm bundle size (scoped)',
        description,
        parameters: [
          pathParam({
            name: 'format',
            schema: { type: 'string', enum: this.getEnum('format') },
            example: 'min',
          }),
          pathParam({
            name: 'scope',
            example: '@cycle',
          }),
          pathParam({
            name: 'packageName',
            example: 'core',
          }),
          unitsOpenApiParam(defaultUnits),
        ],
      },
    },
    '/bundlephobia/{format}/{packageName}/{version}': {
      get: {
        summary: 'npm bundle size (version)',
        description,
        parameters: [
          pathParam({
            name: 'format',
            schema: { type: 'string', enum: this.getEnum('format') },
            example: 'min',
          }),
          pathParam({
            name: 'packageName',
            example: 'react',
          }),
          pathParam({
            name: 'version',
            example: '15.0.0',
          }),
          unitsOpenApiParam(defaultUnits),
        ],
      },
    },
    '/bundlephobia/{format}/{scope}/{packageName}/{version}': {
      get: {
        summary: 'npm bundle size (scoped version)',
        description,
        parameters: [
          pathParam({
            name: 'format',
            schema: { type: 'string', enum: this.getEnum('format') },
            example: 'min',
          }),
          pathParam({
            name: 'scope',
            example: '@cycle',
          }),
          pathParam({
            name: 'packageName',
            example: 'core',
          }),
          pathParam({
            name: 'version',
            example: '7.0.0',
          }),
          unitsOpenApiParam(defaultUnits),
        ],
      },
    },
  }

  static _cacheLength = 900

  static defaultBadgeData = { label: 'bundlephobia', color: 'informational' }

  static render({ format, size, units }) {
    const label = format === 'min' ? 'minified size' : 'minzipped size'
    return renderSizeBadge(size, units, label)
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
      httpErrors: {
        404: 'package or version not found',
      },
    })
  }

  async handle({ format, scope, packageName, version }, { units }) {
    const json = await this.fetch({ scope, packageName, version })
    const size = format === 'min' ? json.size : json.gzip
    return this.constructor.render({ format, size, units })
  }
}
