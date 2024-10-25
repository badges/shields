import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { renderLicenseBadge } from '../licenses.js'
import toArray from '../../core/base-service/to-array.js'
import { queryParamSchema, description, ScoopBase } from './scoop-base.js'

const scoopLicenseSchema = Joi.object({
  license: Joi.alternatives()
    .try(
      Joi.string().required(),
      Joi.object({
        identifier: Joi.string().required(),
      }),
    )
    .required(),
}).required()

export default class ScoopLicense extends ScoopBase {
  static category = 'license'

  static route = {
    base: 'scoop/l',
    pattern: ':app',
    queryParamSchema,
  }

  static openApi = {
    '/scoop/l/{app}': {
      get: {
        summary: 'Scoop License',
        description,
        parameters: [
          pathParam({ name: 'app', example: 'ngrok' }),
          queryParam({
            name: 'bucket',
            description:
              "App's containing bucket. Can either be a name (e.g `extras`) or a URL to a GitHub Repo (e.g `https://github.com/jewlexx/personal-scoop`)",
            example: 'extras',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'license' }

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  async handle({ app }, queryParams) {
    const { license } = await this.fetch(
      { app, schema: scoopLicenseSchema },
      queryParams,
    )

    const licenses = toArray(license).map(license =>
      typeof license === 'string' ? license : license.identifier,
    )

    return this.constructor.render({ licenses })
  }
}
