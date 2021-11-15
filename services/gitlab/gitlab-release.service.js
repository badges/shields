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
  date_order_by: Joi.string()
    .valid('created_at', 'released_at')
    .default('created_at'),
}).required()

const documentation = `
<p>
  You may use your GitLab Project Id (e.g. 25813592) or your Project Path (e.g. megabyte-labs/dockerfile/ci-pipeline/ansible-lint)
</p>
`
const commonProps = {
  namedParams: {
    project: 'shields-ops-group/tag-test',
  },
  documentation,
}

export default class GitLabRelease extends GitLabBase {
  static category = 'version'

  static route = {
    base: 'gitlab/v/release',
    pattern: ':project+',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitLab Release (latest by date)',
      ...commonProps,
      queryParams: { sort: 'date', date_order_by: 'created_at' },
      staticPreview: renderVersionBadge({ version: 'v2.0.0' }),
    },
    {
      title: 'GitLab Release (latest by SemVer)',
      ...commonProps,
      queryParams: { sort: 'semver' },
      staticPreview: renderVersionBadge({ version: 'v4.0.0' }),
    },
    {
      title: 'GitLab Release (latest by SemVer pre-release)',
      ...commonProps,
      queryParams: {
        sort: 'semver',
        include_prereleases: null,
      },
      staticPreview: renderVersionBadge({ version: 'v5.0.0-beta.1' }),
    },
    {
      title: 'GitLab Release (custom instance)',
      namedParams: {
        project: 'GNOME/librsvg',
      },
      documentation,
      queryParams: {
        sort: 'semver',
        include_prereleases: null,
        gitlab_url: 'https://gitlab.gnome.org',
        date_order_by: 'created_at',
      },
      staticPreview: renderVersionBadge({ version: 'v2.51.4' }),
    },
    {
      title: 'GitLab Release (by release name)',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      documentation,
      queryParams: {
        sort: 'semver',
        include_prereleases: null,
        gitlab_url: 'https://gitlab.com',
        display_name: 'release',
        date_order_by: 'created_at',
      },
      staticPreview: renderVersionBadge({ version: 'GitLab 14.2' }),
    },
  ]

  static defaultBadgeData = { label: 'release' }

  async fetch({ project, baseUrl, isSemver, orderBy }) {
    // https://docs.gitlab.com/ee/api/releases/
    return this.fetchPaginatedArrayData({
      schema,
      url: `${baseUrl}/api/v4/projects/${encodeURIComponent(project)}/releases`,
      errorMessages: {
        404: 'project not found',
      },
      options: {
        searchParams: { order_by: orderBy },
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
    { project },
    {
      gitlab_url: baseUrl = 'https://gitlab.com',
      include_prereleases: pre,
      sort,
      display_name: displayName,
      date_order_by: orderBy,
    }
  ) {
    const isSemver = sort === 'semver'
    const releases = await this.fetch({ project, baseUrl, isSemver, orderBy })
    const version = this.constructor.transform({
      releases,
      isSemver,
      includePrereleases: pre !== undefined,
      displayName,
    })
    return renderVersionBadge({ version })
  }
}
