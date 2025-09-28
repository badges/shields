import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { renderDateBadge } from '../date.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.alternatives(
  Joi.object({
    created_at: Joi.date().required(),
    published_at: Joi.date().required(),
  }).required(),
  Joi.array()
    .items(
      Joi.object({
        created_at: Joi.date().required(),
        published_at: Joi.date().required(),
      }).required(),
    )
    .min(1),
)

const displayDateEnum = ['created_at', 'published_at']

const queryParamSchema = Joi.object({
  display_date: Joi.string()
    .valid(...displayDateEnum)
    .default('created_at'),
}).required()

export default class GithubReleaseDate extends GithubAuthV3Service {
  static category = 'activity'
  static route = {
    base: 'github',
    pattern: ':variant(release-date|release-date-pre)/:user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/github/{variant}/{user}/{repo}': {
      get: {
        summary: 'GitHub Release Date',
        description: documentation,
        parameters: [
          pathParam({
            name: 'variant',
            example: 'release-date',
            schema: { type: 'string', enum: this.getEnum('variant') },
          }),
          pathParam({ name: 'user', example: 'SubtitleEdit' }),
          pathParam({ name: 'repo', example: 'subtitleedit' }),
          queryParam({
            name: 'display_date',
            example: 'published_at',
            schema: { type: 'string', enum: displayDateEnum },
            description: 'Default value is `created_at` if not specified',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'release date' }

  async fetch({ variant, user, repo }) {
    const url =
      variant === 'release-date'
        ? `/repos/${user}/${repo}/releases/latest`
        : `/repos/${user}/${repo}/releases`
    return this._requestJson({
      url,
      schema,
      httpErrors: httpErrorsFor('no releases or repo not found'),
    })
  }

  async handle({ variant, user, repo }, queryParams) {
    const body = await this.fetch({ variant, user, repo })
    if (Array.isArray(body)) {
      return renderDateBadge(body[0][queryParams.display_date])
    }
    return renderDateBadge(body[queryParams.display_date])
  }
}
