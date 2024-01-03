import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { BaseCpanService, description } from './cpan.js'

export default class CpanVersion extends BaseCpanService {
  static category = 'version'
  static route = { base: 'cpan/v', pattern: ':packageName' }

  static openApi = {
    '/cpan/v/{packageName}': {
      get: {
        summary: 'CPAN Version',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'Config-Augeas',
        }),
      },
    },
  }

  async handle({ packageName }) {
    const { version } = await this.fetch({ packageName })
    return renderVersionBadge({ version })
  }
}
