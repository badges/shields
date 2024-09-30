import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { renderSizeBadge, unitsQueryParam, unitsOpenApiParam } from '../size.js'
import { optionalNonNegativeInteger } from '../validators.js'
import NpmBase, {
  packageNameDescription,
  queryParamSchema as baseQueryParamSchema,
} from './npm-base.js'

const defaultUnits = 'metric'

const schema = Joi.object({
  dist: Joi.object({
    unpackedSize: optionalNonNegativeInteger,
  }).required(),
}).required()

const queryParamSchema = baseQueryParamSchema.keys({
  units: unitsQueryParam.default(defaultUnits),
})

export default class NpmUnpackedSize extends NpmBase {
  static category = 'size'

  static route = {
    base: 'npm/unpacked-size',
    pattern: ':scope(@[^/]+)?/:packageName/:version*',
    queryParamSchema,
  }

  static openApi = {
    '/npm/unpacked-size/{packageName}': {
      get: {
        summary: 'NPM Unpacked Size',
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'npm',
            description: packageNameDescription,
          }),
          queryParam({
            name: 'registry_uri',
            example: 'https://registry.npmjs.com',
          }),
          unitsOpenApiParam(defaultUnits),
        ],
      },
    },
    '/npm/unpacked-size/{packageName}/{version}': {
      get: {
        summary: 'NPM Unpacked Size (with version)',
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'npm',
            description: packageNameDescription,
          }),
          pathParam({
            name: 'version',
            example: '4.18.2',
          }),
          queryParam({
            name: 'registry_uri',
            example: 'https://registry.npmjs.com',
          }),
          unitsOpenApiParam(defaultUnits),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'unpacked size' }

  async fetch({ registryUrl, packageName, version }) {
    return this._requestJson({
      schema,
      url: `${registryUrl}/${packageName}/${version}`,
    })
  }

  async handle(
    { scope, packageName, version },
    { registry_uri: registryUrl = 'https://registry.npmjs.org', units },
  ) {
    const packageNameWithScope = scope ? `${scope}/${packageName}` : packageName
    const { dist } = await this.fetch({
      registryUrl,
      packageName: packageNameWithScope,
      version: version ?? 'latest',
    })
    const { unpackedSize } = dist

    if (unpackedSize) {
      return renderSizeBadge(unpackedSize, units, 'unpacked size')
    }
    return {
      label: 'unpacked size',
      message: 'unknown',
      color: 'lightgray',
    }
  }
}
