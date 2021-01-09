'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV3Service } = require('./github-auth-service')
const {
  fetchLatestRelease,
  queryParamSchema,
} = require('./github-common-release')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.object({ ahead_by: nonNegativeInteger }).required()

module.exports = class GithubCommitsSince extends GithubAuthV3Service {
  static category = 'activity'
  static route = {
    base: 'github/commits-since',
    pattern: ':user/:repo/:version/:branch*',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub commits since tagged version',
      namedParams: {
        user: 'SubtitleEdit',
        repo: 'subtitleedit',
        version: '3.4.7',
      },
      staticPreview: this.renderStaticPreview({
        version: '3.4.7',
        commitCount: 4225,
      }),
      documentation,
    },
    {
      title: 'GitHub commits since tagged version (branch)',
      namedParams: {
        user: 'SubtitleEdit',
        repo: 'subtitleedit',
        version: '3.4.7',
        branch: 'master',
      },
      staticPreview: this.renderStaticPreview({
        version: '3.4.7',
        commitCount: 4225,
      }),
      documentation,
    },
    {
      title: 'GitHub commits since latest release (by date)',
      namedParams: {
        user: 'SubtitleEdit',
        repo: 'subtitleedit',
        version: 'latest',
      },
      staticPreview: this.renderStaticPreview({
        version: '3.5.7',
        commitCount: 157,
      }),
      documentation,
    },
    {
      title: 'GitHub commits since latest release (by date) for a branch',
      namedParams: {
        user: 'SubtitleEdit',
        repo: 'subtitleedit',
        version: 'latest',
        branch: 'master',
      },
      staticPreview: this.renderStaticPreview({
        version: '3.5.7',
        commitCount: 157,
      }),
      documentation,
    },
    {
      title:
        'GitHub commits since latest release (by date including pre-releases)',
      namedParams: {
        user: 'SubtitleEdit',
        repo: 'subtitleedit',
        version: 'latest',
      },
      queryParams: { include_prereleases: null },
      staticPreview: this.renderStaticPreview({
        version: 'v3.5.8-alpha.1',
        isPrerelease: true,
        commitCount: 158,
      }),
      documentation,
    },
    {
      title: 'GitHub commits since latest release (by SemVer)',
      namedParams: {
        user: 'SubtitleEdit',
        repo: 'subtitleedit',
        version: 'latest',
      },
      queryParams: { sort: 'semver' },
      staticPreview: this.renderStaticPreview({
        version: 'v4.0.1',
        sort: 'semver',
        commitCount: 200,
      }),
      documentation,
    },
    {
      title:
        'GitHub commits since latest release (by SemVer including pre-releases)',
      namedParams: {
        user: 'SubtitleEdit',
        repo: 'subtitleedit',
        version: 'latest',
      },
      queryParams: { sort: 'semver', include_prereleases: null },
      staticPreview: this.renderStaticPreview({
        version: 'v4.0.2-alpha.1',
        sort: 'semver',
        isPrerelease: true,
        commitCount: 201,
      }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'github', namedLogo: 'github' }

  static render({ user, repo, branch, version, commitCount }) {
    const slug = `${encodeURIComponent(user)}/${encodeURIComponent(repo)}`
    return {
      label: `commits since ${version}`,
      message: metric(commitCount),
      color: 'blue',
      link: [
        `https://github.com/${slug}`,
        `https://github.com/${slug}/compare/${version}...${branch || 'HEAD'}`,
      ],
    }
  }

  // TODO: can shift this function to BaseService (to handle cases where link is present in render
  // response and staticPreview doesn't supports it)
  static renderStaticPreview(props) {
    const renderedResponse = this.render(props)
    delete renderedResponse.link
    return renderedResponse
  }

  async handle({ user, repo, version, branch }, queryParams) {
    if (version === 'latest') {
      ;({ tag_name: version } = await fetchLatestRelease(
        this,
        {
          user,
          repo,
        },
        queryParams
      ))
    }

    const notFoundMessage = branch
      ? 'repo, branch or version not found'
      : 'repo or version not found'
    const { ahead_by: commitCount } = await this._requestJson({
      schema,
      url: `/repos/${user}/${repo}/compare/${version}...${branch || 'HEAD'}`,
      errorMessages: errorMessagesFor(notFoundMessage),
    })

    return this.constructor.render({ user, repo, branch, version, commitCount })
  }
}
