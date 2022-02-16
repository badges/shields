import Joi from 'joi'
import { version as versionColor } from '../color-formatters.js'
import { optionalUrl } from '../validators.js'
import { latest } from '../version.js'
import { addv } from '../text-formatters.js'
import { NotFound } from '../index.js'
import GitLabBase from './gitlab-base.js'

const schema = Joi.array().items(
  Joi.object({
    name: Joi.string().required(),
  })
)

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
  include_prereleases: Joi.equal(''),
  sort: Joi.string().valid('date', 'semver').default('date'),
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

export default class GitlabTag extends GitLabBase {
  static category = 'version'

  static route = {
    base: 'gitlab/v/tag',
    pattern: ':project+',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitLab tag (latest by date)',
      ...commonProps,
      queryParams: { sort: 'date' },
      staticPreview: this.render({ version: 'v2.0.0' }),
    },
    {
      title: 'GitLab tag (latest by SemVer)',
      ...commonProps,
      queryParams: { sort: 'semver' },
      staticPreview: this.render({ version: 'v4.0.0' }),
    },
    {
      title: 'GitLab tag (latest by SemVer pre-release)',
      ...commonProps,
      queryParams: {
        sort: 'semver',
        include_prereleases: null,
      },
      staticPreview: this.render({ version: 'v5.0.0-beta.1', sort: 'semver' }),
    },
    {
      title: 'GitLab tag (custom instance)',
      namedParams: {
        project: 'GNOME/librsvg',
      },
      documentation,
      queryParams: {
        sort: 'semver',
        include_prereleases: null,
        gitlab_url: 'https://gitlab.gnome.org',
      },
      staticPreview: this.render({ version: 'v2.51.4' }),
    },
  ]

  static defaultBadgeData = { label: 'tag' }

  static render({ version, sort }) {
    return {
      message: addv(version),
      color: sort === 'semver' ? versionColor(version) : 'blue',
    }
  }

  async fetch({ project, baseUrl }) {
    // https://docs.gitlab.com/ee/api/tags.html
    // N.B. the documentation has contradictory information about default sort order.
    // As of 2020-10-11 the default is by date, but we add the `order_by` query param
    // explicitly in case that changes upstream.
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v4/projects/${encodeURIComponent(
        project
      )}/repository/tags`,
      options: { searchParams: { order_by: 'updated' } },
      errorMessages: {
        404: 'repo not found',
      },
    })
  }

  static transform({ tags, sort, includePrereleases }) {
    if (tags.length === 0) {
      throw new NotFound({ prettyMessage: 'no tags found' })
    }

    if (sort === 'date') {
      return tags[0].name
    }

    return latest(
      tags.map(t => t.name),
      { pre: includePrereleases }
    )
  }

  async handle(
    { project },
    {
      gitlab_url: baseUrl = 'https://gitlab.com',
      include_prereleases: pre,
      sort,
    }
  ) {
    const tags = await this.fetch({ project, baseUrl })
    const version = this.constructor.transform({
      tags,
      sort,
      includePrereleases: pre !== undefined,
    })
    return this.constructor.render({ version, sort })
  }
}
