import Joi from 'joi'
import prettyBytes from 'pretty-bytes'
import { BaseJsonService } from '../index.js'

export default class NpmUnpackedSize extends BaseJsonService {
  static category = 'size'
  static route = {
    base: 'npm/unpacked-size',
    pattern: ':packageName/:version*',
  }

  async fetch({ packageName, version }) {
    return this._requestJson({
      schema: Joi.any(),
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
