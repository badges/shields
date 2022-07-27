import Joi from 'joi'
import { addv } from '../text-formatters.js'
import { version as versionColor } from '../color-formatters.js'
import { redirector } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import {
  fetchLatestRelease,
  queryParamSchema,
} from './github-common-release.js'
import { documentation } from './github-helpers.js'

const extendedQueryParamSchema = Joi.object({
  display_name: Joi.string().valid('tag', 'release').default('tag'),
})

class GithubRelease extends GithubAuthV3Service {
  static category = 'version'
  static route = {
    base: 'github/v/release',
    pattern: ':user/:repo',
    queryParamSchema: queryParamSchema.concat(extendedQueryParamSchema),
  }

  static examples = [
    {
      title: 'GitHub release (latest by date)',
      namedParams: { user: 'expressjs', repo: 'express' },
      queryParams: { display_name: 'tag' },
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
      queryParams: { include_prereleases: null, display_name: 'tag' },
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
      queryParams: { sort: 'semver', display_name: 'tag' },
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
      queryParams: {
        sort: 'semver',
        include_prereleases: null,
        display_name: 'tag',
      },
      staticPreview: this.render({
        version: 'v5.0.0-alpha.7',
        sort: 'semver',
        isPrerelease: true,
      }),
      documentation,
    },
    {
      title: 'GitHub release (release name instead of tag name)',
      namedParams: { user: 'gooddata', repo: 'gooddata-java' },
      queryParams: {
        sort: 'date',
        include_prereleases: null,
        display_name: 'release',
      },
      staticPreview: this.render({
        version: '3.7.0+api3',
        sort: 'date',
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
      queryParams
    )
    const { version, isPrerelease } = this.constructor.transform(
      latestRelease,
      queryParams.display_name
    )
    return this.constructor.render({
      version,
      sort: queryParams.sort,
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
