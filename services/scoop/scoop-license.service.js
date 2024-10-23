import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { renderLicenseBadge } from '../licenses.js'
import toArray from '../../core/base-service/to-array.js'
import { description, ScoopBase } from './scoop-base.js'

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

const queryParamSchema = Joi.object({
  bucket: Joi.string(),
})

export default class ScoopLicense extends ScoopBase {
  // The buckets file (https://github.com/lukesampson/scoop/blob/master/buckets.json) changes very rarely.
  // Cache it for the lifetime of the current Node.js process.
  buckets = null

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
        description:
          '[Scoop](https://scoop.sh/) is a command-line installer for Windows',
        parameters: [
          pathParam({ name: 'app', example: 'ngrok' }),
          queryParam({
            name: 'bucket',
            description,
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
