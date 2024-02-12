import Joi from 'joi'
import prettyBytes from 'pretty-bytes'
import { pathParam } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import NpmBase, { packageNameDescription } from './npm-base.js'

const schema = Joi.object({
  dist: Joi.object({
    unpackedSize: nonNegativeInteger,
  }).required(),
}).required()

export default class NpmUnpackedSize extends NpmBase {
  static category = 'size'

  static route = {
    base: 'npm/unpacked-size',
    pattern: ':packageName/:version*',
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
        ],
      },
    },
  }

  async fetch({ packageName, version }) {
    return this._requestJson({
      schema,
      url: `https://registry.npmjs.org/${packageName}/${version}`,
    })
  }

  async handle({ packageName, version }) {
    const { dist } = await this.fetch({
      packageName,
      version: version ?? 'latest',
    })
    const { unpackedSize } = dist

    return {
      label: 'unpacked size',
      message: unpackedSize ? prettyBytes(unpackedSize) : 'unknown',
      color: unpackedSize ? 'blue' : 'lightgray',
    }
  }
}
