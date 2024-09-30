import Joi from 'joi'
import { InvalidResponse, pathParam } from '../index.js'
import { renderSizeBadge, unitsQueryParam, unitsOpenApiParam } from '../size.js'
import { BaseCratesService, description } from './crates-base.js'

const defaultUnits = 'IEC'

const queryParamSchema = Joi.object({
  units: unitsQueryParam.default(defaultUnits),
}).required()

export default class CratesSize extends BaseCratesService {
  static category = 'size'
  static route = {
    base: 'crates/size',
    pattern: ':crate/:version?',
    queryParamSchema,
  }

  static openApi = {
    '/crates/size/{crate}': {
      get: {
        summary: 'Crates.io Size',
        description,
        parameters: [
          pathParam({
            name: 'crate',
            example: 'rustc-serialize',
          }),
          unitsOpenApiParam(defaultUnits),
        ],
      },
    },
    '/crates/size/{crate}/{version}': {
      get: {
        summary: 'Crates.io Size (version)',
        description,
        parameters: [
          pathParam({
            name: 'crate',
            example: 'rustc-serialize',
          }),
          pathParam({
            name: 'version',
            example: '0.3.24',
          }),
          unitsOpenApiParam(defaultUnits),
        ],
      },
    },
  }

  async handle({ crate, version }, { units }) {
    const json = await this.fetch({ crate, version })
    const size = this.constructor.getVersionObj(json).crate_size

    if (size == null) {
      throw new InvalidResponse({ prettyMessage: 'unknown' })
    }

    return renderSizeBadge(size, units)
  }
}
