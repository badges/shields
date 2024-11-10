import Joi from 'joi'
import { redirector, pathParam, queryParam } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import {
  fetchLatestRelease,
  queryParamSchema,
  openApiQueryParams,
} from './github-common-release.js'
import { documentation } from './github-helpers.js'

const displayNameEnum = ['tag', 'release']
const extendedQueryParamSchema = Joi.object({
  display_name: Joi.string()
    .valid(...displayNameEnum)
    .default('tag'),
})

class GithubRelease extends GithubAuthV3Service {
  static category = 'version'
  static route = {
    base: 'github/v/release',
    pattern: ':user/:repo',
    queryParamSchema: queryParamSchema.concat(extendedQueryParamSchema),
  }

  static openApi = {
    '/github/v/release/{user}/{repo}': {
      get: {
        summary: 'GitHub Release',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'expressjs' }),
          pathParam({ name: 'repo', example: 'express' }),
          ...openApiQueryParams,
          queryParam({
            name: 'display_name',
            example: 'tag',
            schema: { type: 'string', enum: displayNameEnum },
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'release' }

  static transform(latestRelease, display) {
    const { name, tag_name: tagName, prerelease: isPrerelease } = latestRelease
    if (display === 'tag') {
      return { isPrerelease, version: tagName }
    }

    return { version: name || tagName, isPrerelease }
  }

  async handle({ user, repo }, queryParams) {
    const latestRelease = await fetchLatestRelease(
      this,
      { user, repo },
      queryParams,
    )
    const { version, isPrerelease } = this.constructor.transform(
      latestRelease,
      queryParams.display_name,
    )
    return renderVersionBadge({
      version,
      isPrerelease,
    })
  }
}

const redirects = {
  GithubReleaseRedirect: redirector({
    name: 'GithubReleaseRedirect',
    category: 'version',
    route: {
      base: 'github/release',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) => `/github/v/release/${user}/${repo}`,
    dateAdded: new Date('2019-08-17'),
  }),
  GithubReleasePreRedirect: redirector({
    category: 'version',
    route: {
      base: 'github/release-pre',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) => `/github/v/release/${user}/${repo}`,
    transformQueryParams: params => ({ include_prereleases: null }),
    dateAdded: new Date('2019-08-17'),
  }),
  GithubReleaseRedirectAll: redirector({
    name: 'GithubReleaseRedirectAll',
    category: 'version',
    route: {
      base: 'github/release',
      pattern: ':user/:repo/all',
    },
    transformPath: ({ user, repo }) => `/github/v/release/${user}/${repo}`,
    transformQueryParams: params => ({ include_prereleases: null }),
    dateAdded: new Date('2019-08-17'),
  }),
}

export { GithubRelease, redirects }
