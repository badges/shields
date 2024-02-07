import { BaseJsonService } from '../index.js'

export default class NpmUnpackedSize extends BaseJsonService {
  static category = 'size'
  static route = { base: 'npm/unpacked-size', pattern: ':packageName' }

  async handle() {
    return {
      label: 'example',
      message: 'text',
      color: 'blue',
    }
  }
}
