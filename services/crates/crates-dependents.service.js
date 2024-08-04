import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseCratesService, description } from './crates-base.js'

const dependentsResponseSchema = Joi.object({
  meta: Joi.object({
    total: nonNegativeInteger,
  }).required(),
}).required()

export default class CratesDependents extends BaseCratesService {
  static category = 'other'
  static route = { base: 'crates/dependents', pattern: ':crate' }

  static openApi = {
    '/crates/dependents/{crate}': {
      get: {
        summary: 'Crates.io Dependents',
        description,
        parameters: pathParams({
          name: 'crate',
          example: 'tokio',
        }),
      },
    },
  }

  static render({ dependentCount }) {
    return {
      label: 'dependents',
      message: metric(dependentCount),
      color: dependentCount === 0 ? 'orange' : 'brightgreen',
    }
  }

  async fetch({ crate }) {
    const url = `https://crates.io/api/v1/crates/${crate}/reverse_dependencies`
    const schema = dependentsResponseSchema
    return this._requestJson({ schema, url })
  }

  async handle({ crate }) {
    const json = await this.fetch({ crate })
    const { total: dependentCount } = json.meta
    return this.constructor.render({ dependentCount })
  }
}
