import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { latest, renderVersionBadge } from '../version.js'
import { NotFound, pathParam, queryParam } from '../index.js'
import { description, httpErrorsFor } from './gitea-helper.js'
import GiteaBase from './gitea-base.js'

const schema = Joi.array().items(
  Joi.object({
    name: Joi.string().required(),
  }),
)

const sortEnum = ['date', 'semver']

const queryParamSchema = Joi.object({
  gitea_url: optionalUrl,
  include_prereleases: Joi.boolean().default(false),
  sort: Joi.string()
    .valid(...sortEnum)
    .default('date'),
}).required()

export default class GiteaTag extends GiteaBase {
  static category = 'version'

  static route = {
    base: 'gitea/v/tag',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/gitea/v/tag/{user}/{repo}': {
      get: {
        summary: 'Gitea Tag',
        description,
        parameters: [
          pathParam({
            name: 'user',
            example: 'gitea',
          }),
          pathParam({
            name: 'repo',
            example: 'tea',
          }),
          queryParam({
            name: 'gitea_url',
            example: 'https://gitea.com',
          }),
          queryParam({
            name: 'include_prereleases',
            schema: { type: 'boolean' },
            example: 'false',
          }),
          queryParam({
            name: 'sort',
            schema: { type: 'string', enum: sortEnum },
            example: 'semver',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'tag' }

  async fetch({ user, repo, baseUrl }) {
    // https://gitea.com/api/swagger#/repository/repoListTags
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v1/repos/${user}/${repo}/tags`,
      httpErrors: httpErrorsFor(),
    })
  }

  static transform({ tags, sort, includePrereleases }) {
    if (tags.length === 0) {
      throw new NotFound({ prettyMessage: 'no tags found' })
    }

    if (sort === 'semver') {
      return latest(
        tags.map(t => t.name),
        { pre: includePrereleases },
      )
    }

    return tags[0].name
  }

  async handle(
    { user, repo },
    {
      gitea_url: baseUrl = 'https://gitea.com',
      include_prereleases: includePrereleases,
      sort,
    },
  ) {
    const tags = await this.fetch({
      user,
      repo,
      baseUrl,
    })
    const version = this.constructor.transform({
      tags,
      sort,
      includePrereleases,
    })
    return renderVersionBadge({ version })
  }
}
