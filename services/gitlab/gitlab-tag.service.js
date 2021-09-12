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

export default class GitlabTag extends GitLabBase {
  static category = 'version'

  static route = {
    base: 'gitlab/v/tag',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitLab tag (latest by date)',
      namedParams: {
        user: 'shields-ops-group',
        repo: 'tag-test',
      },
      queryParams: { sort: 'semver' },
      staticPreview: this.render({ name: 'v2.0.0' }),
    },
    {
      title: 'GitLab tag (latest by SemVer)',
      namedParams: {
        user: 'shields-ops-group',
        repo: 'tag-test',
      },
      queryParams: { sort: 'semver' },
      staticPreview: this.render({ name: 'v4.0.0' }),
    },
    {
      title: 'GitLab tag (latest by SemVer pre-release)',
      namedParams: {
        user: 'shields-ops-group',
        repo: 'tag-test',
      },
      queryParams: {
        sort: 'semver',
        include_prereleases: null,
      },
      staticPreview: this.render({ name: 'v5.0.0-beta.1' }),
    },
    {
      title: 'GitLab tag (custom instance)',
      namedParams: {
        user: 'GNOME',
        repo: 'librsvg',
      },
      queryParams: {
        sort: 'semver',
        include_prereleases: null,
        gitlab_url: 'https://gitlab.gnome.org',
      },
      staticPreview: this.render({ name: 'v2.51.4' }),
    },
  ]

  static defaultBadgeData = { label: 'tag' }

  static render({ version, sort }) {
    return {
      message: addv(version),
      color: sort === 'semver' ? versionColor(version) : 'blue',
    }
  }

  async fetch({ user, repo, baseUrl }) {
    // https://docs.gitlab.com/ee/api/tags.html
    // N.B. the documentation has contradictory information about default sort order.
    // As of 2020-10-11 the default is by date, but we add the `order_by` query param
    // explicitly in case that changes upstream.
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v4/projects/${user}%2F${repo}/repository/tags`,
      options: { qs: { order_by: 'updated' } },
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
    { user, repo },
    {
      gitlab_url: baseUrl = 'https://gitlab.com',
      include_prereleases: pre,
      sort,
    }
  ) {
    const tags = await this.fetch({ user, repo, baseUrl })
    const version = this.constructor.transform({
      tags,
      sort,
      includePrereleases: pre !== undefined,
    })
    return this.constructor.render({ version, sort })
  }
}
