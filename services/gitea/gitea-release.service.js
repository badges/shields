import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { latest, renderVersionBadge } from '../version.js'
import { NotFound, pathParam, queryParam } from '../index.js'
import { description, httpErrorsFor } from './gitea-helper.js'
import GiteaBase from './gitea-base.js'

const schema = Joi.array().items(
  Joi.object({
    name: Joi.string().required(),
    tag_name: Joi.string().required(),
    prerelease: Joi.boolean().required(),
  }),
)

const sortEnum = ['date', 'semver']
const displayNameEnum = ['tag', 'release']
const dateOrderByEnum = ['created_at', 'published_at']

const queryParamSchema = Joi.object({
  gitea_url: optionalUrl,
  include_prereleases: Joi.equal(''),
  sort: Joi.string()
    .valid(...sortEnum)
    .default('date'),
  display_name: Joi.string()
    .valid(...displayNameEnum)
    .default('tag'),
  date_order_by: Joi.string()
    .valid(...dateOrderByEnum)
    .default('created_at'),
}).required()

export default class GiteaRelease extends GiteaBase {
  static category = 'version'

  static route = {
    base: 'gitea/v/release',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/gitea/v/release/{user}/{repo}': {
      get: {
        summary: 'Gitea Release',
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
            example: null,
          }),
          queryParam({
            name: 'sort',
            schema: { type: 'string', enum: sortEnum },
            example: 'semver',
          }),
          queryParam({
            name: 'display_name',
            schema: { type: 'string', enum: displayNameEnum },
            example: 'release',
          }),
          queryParam({
            name: 'date_order_by',
            schema: { type: 'string', enum: dateOrderByEnum },
            example: 'created_at',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'release' }

  async fetch({ user, repo, baseUrl }) {
    // https://gitea.com/api/swagger#/repository/repoGetRelease
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v1/repos/${user}/${repo}/releases`,
      httpErrors: httpErrorsFor(),
    })
  }

  static transform({ releases, isSemver, includePrereleases, displayName }) {
    if (releases.length === 0) {
      throw new NotFound({ prettyMessage: 'no releases found' })
    }

    const displayKey = displayName === 'tag' ? 'tag_name' : 'name'

    if (isSemver) {
      return latest(
        releases.map(t => t[displayKey]),
        { pre: includePrereleases },
      )
    }

    if (!includePrereleases) {
      const stableReleases = releases.filter(release => !release.prerelease)
      if (stableReleases.length > 0) {
        return stableReleases[0][displayKey]
      }
    }

    return releases[0][displayKey]
  }

  async handle(
    { user, repo },
    {
      gitea_url: baseUrl = 'https://gitea.com',
      include_prereleases: pre,
      sort,
      display_name: displayName,
      date_order_by: orderBy,
    },
  ) {
    const isSemver = sort === 'semver'
    const releases = await this.fetch({
      user,
      repo,
      baseUrl,
      isSemver,
    })
    const version = this.constructor.transform({
      releases,
      isSemver,
      includePrereleases: pre !== undefined,
      displayName,
    })
    return renderVersionBadge({ version })
  }
}
