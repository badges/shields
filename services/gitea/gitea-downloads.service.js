import Joi from 'joi'
import { NotFound, pathParam, queryParam } from '../index.js'
import { nonNegativeInteger, optionalUrl } from '../validators.js'
import { renderDownloadsBadge } from '../downloads.js'
import GiteaBase from './gitea-base.js'
import { description, httpErrorsFor } from './gitea-helper.js'

const queryParamSchema = Joi.object({
  gitea_url: optionalUrl,
  include_prereleases: Joi.boolean().default(true),
}).required()

const releaseSchema = Joi.object({
  assets: Joi.array()
    .items(
      Joi.object({
        download_count: nonNegativeInteger,
      }),
    )
    .required(),
}).required()

const releasesArraySchema = Joi.array().items(releaseSchema.optional())

const userParam = pathParam({ name: 'user', example: 'gitea' })
const repoParam = pathParam({ name: 'repo', example: 'tea' })
const tagParam = pathParam({
  name: 'tag',
  example: 'latest',
  description: 'Tag name or `latest`',
})
const giteaUrlParam = queryParam({
  name: 'gitea_url',
  example: 'https://gitea.com',
})
const includePrereleasesParam = queryParam({
  name: 'include_prereleases',
  example: 'true',
  schema: { type: 'boolean' },
})

export default class GiteaDownloads extends GiteaBase {
  static category = 'downloads'
  static route = {
    base: 'gitea',
    pattern: ':variant/:user/:repo/:tag?',
    queryParamSchema,
  }
  static routeEnum = ['dt', 'dv']

  static openApi = {
    '/gitea/dt/{user}/{repo}': {
      get: {
        summary: 'Gitea Downloads',
        description,
        parameters: [
          userParam,
          repoParam,
          giteaUrlParam,
          includePrereleasesParam,
        ],
      },
    },
    '/gitea/dv/{user}/{repo}/{tag}': {
      get: {
        summary: 'Gitea Downloads (release)',
        description,
        parameters: [userParam, repoParam, tagParam, giteaUrlParam],
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  static render({ downloads, tag }) {
    return renderDownloadsBadge({ downloads, version: tag })
  }

  async fetch({ user, repo, tag, baseUrl, includePrereleases }) {
    if (!tag) {
      // https://gitea.com/api/swagger#/repository/repoListReleases
      const releases = []
      for (let i = 1; ; i++) {
        const page = await super.fetch({
          schema: releasesArraySchema,
          url: `${baseUrl}/api/v1/repos/${user}/${repo}/releases`,
          options: {
            searchParams: {
              page: i,
              limit: 30,
              ...(includePrereleases ? {} : { 'pre-release': false }),
            },
          },
          httpErrors: httpErrorsFor(),
        })
        releases.push(...page)
        if (page.length < 30) return releases
      }
    } else if (tag === 'latest') {
      // https://gitea.com/api/swagger#/repository/repoGetLatestRelease
      return super.fetch({
        schema: releaseSchema,
        url: `${baseUrl}/api/v1/repos/${user}/${repo}/releases/latest`,
        httpErrors: httpErrorsFor('no releases found'),
      })
    } else {
      // https://gitea.com/api/swagger#/repository/repoGetReleaseByTag
      return super.fetch({
        schema: releaseSchema,
        url: `${baseUrl}/api/v1/repos/${user}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
        httpErrors: httpErrorsFor('release not found'),
      })
    }
  }

  static transform(releases) {
    return releases.reduce(
      (a, { assets }) =>
        a +
        assets.reduce(
          (b, { download_count: downloadCount }) => b + downloadCount,
          0,
        ),
      0,
    )
  }

  async handle(
    { variant, user, repo, tag },
    {
      gitea_url: baseUrl = 'https://gitea.com',
      include_prereleases: includePrereleases,
    },
  ) {
    if (variant === 'dt') {
      const releases = await this.fetch({
        user,
        repo,
        baseUrl,
        includePrereleases,
      })

      if (releases.length === 0)
        throw new NotFound({ prettyMessage: 'no releases found' })

      const downloads = this.constructor.transform(releases)

      return this.constructor.render({ downloads })
    } else {
      const release = await this.fetch({
        user,
        repo,
        tag,
        baseUrl,
      })

      const downloads = this.constructor.transform([release])

      return this.constructor.render({
        tag,
        downloads,
      })
    }
  }
}
