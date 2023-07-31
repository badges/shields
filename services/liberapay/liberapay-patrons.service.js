import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { colorScale } from '../color-formatters.js'
import { LiberapayBase } from './liberapay-base.js'

export default class LiberapayPatrons extends LiberapayBase {
  static route = this.buildRoute('patrons')

  static openApi = {
    '/liberapay/patrons/{entity}': {
      get: {
        summary: 'Liberapay patrons',
        parameters: pathParams({
          name: 'entity',
          example: 'Changaco',
        }),
      },
    },
  }

  static render({ patrons }) {
    return {
      label: 'patrons',
      message: metric(patrons),
      color: colorScale([0, 10, 100])(patrons),
    }
  }

  async handle({ entity }) {
    const data = await this.fetch({ entity })
    return this.constructor.render({ patrons: data.npatrons })
  }
}
