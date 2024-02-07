import Joi from 'joi'
import prettyBytes from 'pretty-bytes'
import { BaseJsonService } from '../index.js'

export default class NpmUnpackedSize extends BaseJsonService {
  static category = 'size'
  static route = { base: 'npm/unpacked-size', pattern: ':packageName' }

  async fetch() {
    return this._requestJson({
      schema: Joi.any(),
      url: 'https://registry.npmjs.org/express/latest',
    })
  }

  async handle() {
    const { dist } = await this.fetch()
    const { unpackedSize } = dist

    return {
      label: 'unpacked size',
      message: prettyBytes(unpackedSize),
      color: 'blue',
    }
  }
}
