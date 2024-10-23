import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { description, ScoopBase } from './scoop-base.js'

const scoopSchema = Joi.object({
  version: Joi.string().required(),
}).required()
const queryParamSchema = Joi.object({
  bucket: Joi.string(),
})

export default class ScoopVersion extends ScoopBase {
  // The buckets file (https://github.com/lukesampson/scoop/blob/master/buckets.json) changes very rarely.
  // Cache it for the lifetime of the current Node.js process.
  buckets = null

  static category = 'version'

  static route = {
    base: 'scoop/v',
    pattern: ':app',
    queryParamSchema,
  }

  static openApi = {
    '/scoop/v/{app}': {
      get: {
        summary: 'Scoop Version',
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

  static defaultBadgeData = { label: 'scoop' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ app }, queryParams) {
    const { version } = await this.fetch(
      { app, schema: scoopSchema },
      queryParams,
    )

    return this.constructor.render({ version })
  }
}
