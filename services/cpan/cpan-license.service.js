import { pathParams } from '../index.js'
import { BaseCpanService, description } from './cpan.js'

export default class CpanLicense extends BaseCpanService {
  static category = 'license'
  static route = { base: 'cpan/l', pattern: ':packageName' }

  static openApi = {
    '/cpan/l/{packageName}': {
      get: {
        summary: 'CPAN License',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'Config-Augeas',
        }),
      },
    },
  }

  static render({ license }) {
    return {
      label: 'license',
      message: license,
      color: 'blue',
    }
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return this.constructor.render({ license: data.license[0] })
  }
}
