import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { latest, renderVersionBadge } from '../version.js'
import { NotFound } from '../index.js'
import GitLabBase from './gitlab-base.js'

const schema = Joi.array().items(
  Joi.object({
    name: Joi.string().required(),
    tag_name: Joi.string().required(),
  })
)

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
  include_prereleases: Joi.equal(''),
  sort: Joi.string().valid('date', 'semver').default('date'),
  display_name: Joi.string().valid('tag', 'release').default('tag'),
}).required()

const namedParams = {
  user: 'shields-ops-group',
  repo: 'repo-test',
}

export default class GitLabRelease extends GitLabBase {
  static category = 'version'

  static route = {
    base: 'gitlab/v/release',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitLab Release (latest by date)',
      namedParams,
      queryParams: { sort: 'date' },
      staticPreview: renderVersionBadge({ version: 'v2.0.0' }),
    },
    {
      title: 'GitLab Release (latest by SemVer)',
      namedParams,
      queryParams: { sort: 'semver' },
      staticPreview: renderVersionBadge({ version: 'v4.0.0' }),
    },
    {
      title: 'GitLab Release (latest by SemVer pre-release)',
      namedParams,
      queryParams: {
        sort: 'semver',
        include_prereleases: null,
      },
      staticPreview: renderVersionBadge({ version: 'v5.0.0-beta.1' }),
    },
    {
      title: 'GitLab Release (custom instance)',
      namedParams: {
        user: 'GNOME',
        repo: 'librsvg',
      },
      queryParams: {
        sort: 'semver',
        include_prereleases: null,
        gitlab_url: 'https://gitlab.gnome.org',
      },
      staticPreview: renderVersionBadge({ version: 'v2.51.4' }),
    },
    {
      title: 'GitLab Release (by release name)',
      namedParams: {
        user: 'gitlab-org',
        repo: 'gitlab',
      },
      queryParams: {
        sort: 'semver',
        include_prereleases: null,
        gitlab_url: 'https://gitlab.com',
        display_name: 'release',
      },
      staticPreview: renderVersionBadge({ version: 'GitLab 14.2' }),
    },
  ]

  static defaultBadgeData = { label: 'release' }

  async fetch({ user, repo, baseUrl, isSemver }) {
    // https://docs.gitlab.com/ee/api/releases/
    return this.fetchPaginatedArrayData({
      schema,
      url: `${baseUrl}/api/v4/projects/${user}%2F${repo}/releases`,
      errorMessages: {
        404: 'project not found',
      },
      firstPageOnly: !isSemver,
    })
  }

  static transform({ releases, isSemver, includePrereleases, displayName }) {
    if (releases.length === 0) {
      throw new NotFound({ prettyMessage: 'no releases found' })
    }

    const displayKey = displayName === 'tag' ? 'tag_name' : 'name'

    if (!isSemver) {
      return releases[0][displayKey]
    }

    return latest(
      releases.map(t => t[displayKey]),
      { pre: includePrereleases }
    )
  }

  async handle(
    { user, repo },
    {
      gitlab_url: baseUrl = 'https://gitlab.com',
      include_prereleases: pre,
      sort,
      display_name: displayName,
    }
  ) {
    const isSemver = sort === 'semver'
    const releases = await this.fetch({ user, repo, baseUrl, isSemver })
    const version = this.constructor.transform({
      releases,
      isSemver,
      includePrereleases: pre !== undefined,
      displayName,
    })
    return renderVersionBadge({ version })
  }
}
