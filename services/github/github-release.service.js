import { addv } from '../text-formatters.js'
import { version as versionColor } from '../color-formatters.js'
import { redirector } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import {
  fetchLatestRelease,
  queryParamSchema,
} from './github-common-release.js'
import { documentation } from './github-helpers.js'

class GithubRelease extends GithubAuthV3Service {
  static category = 'version'
  static route = {
    base: 'github/v/release',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub release (latest by date)',
      namedParams: { user: 'expressjs', repo: 'express' },
      queryParams: {},
      staticPreview: this.render({
        version: 'v4.16.4',
        sort: 'date',
        isPrerelease: false,
      }),
      documentation,
    },
    {
      title: 'GitHub release (latest by date including pre-releases)',
      namedParams: { user: 'expressjs', repo: 'express' },
      queryParams: { include_prereleases: null },
      staticPreview: this.render({
        version: 'v5.0.0-alpha.7',
        sort: 'date',
        isPrerelease: true,
      }),
      documentation,
    },
    {
      title: 'GitHub release (latest SemVer)',
      namedParams: { user: 'expressjs', repo: 'express' },
      queryParams: { sort: 'semver' },
      staticPreview: this.render({
        version: 'v4.16.4',
        sort: 'semver',
        isPrerelease: false,
      }),
      documentation,
    },
    {
      title: 'GitHub release (latest SemVer including pre-releases)',
      namedParams: { user: 'expressjs', repo: 'express' },
      queryParams: { sort: 'semver', include_prereleases: null },
      staticPreview: this.render({
        version: 'v5.0.0-alpha.7',
        sort: 'semver',
        isPrerelease: true,
      }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'release', namedLogo: 'github' }

  static render({ version, sort, isPrerelease }) {
    let color = 'blue'
    color = sort === 'semver' ? versionColor(version) : color
    color = isPrerelease ? 'orange' : color
    return { message: addv(version), color }
  }

  async handle({ user, repo }, queryParams) {
    const latestRelease = await fetchLatestRelease(
      this,
      { user, repo },
      queryParams
    )
    return this.constructor.render({
      version: latestRelease.tag_name,
      sort: queryParams.sort,
      isPrerelease: latestRelease.prerelease,
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
