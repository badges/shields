import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { latest, renderVersionBadge } from '../version.js'
import { NotFound, pathParam, queryParam } from '../index.js'
import { description, httpErrorsFor } from './gitlab-helper.js'
import GitLabBase from './gitlab-base.js'

const schema = Joi.array().items(
  Joi.object({
    name: Joi.string().required(),
  }),
)

const sortEnum = ['date', 'semver']

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
  include_prereleases: Joi.equal(''),
  sort: Joi.string()
    .valid(...sortEnum)
    .default('date'),
}).required()

export default class GitlabTag extends GitLabBase {
  static category = 'version'

  static route = {
    base: 'gitlab/v/tag',
    pattern: ':project+',
    queryParamSchema,
  }

  static openApi = {
    '/gitlab/v/tag/{project}': {
      get: {
        summary: 'GitLab Tag',
        description,
        parameters: [
          pathParam({
            name: 'project',
            example: 'shields-ops-group/tag-test',
          }),
          queryParam({
            name: 'gitlab_url',
            example: 'https://gitlab.com',
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
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'tag' }

  async fetch({ project, baseUrl }) {
    // https://docs.gitlab.com/ee/api/tags.html
    // N.B. the documentation has contradictory information about default sort order.
    // As of 2020-10-11 the default is by date, but we add the `order_by` query param
    // explicitly in case that changes upstream.
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v4/projects/${encodeURIComponent(
        project,
      )}/repository/tags`,
      options: { searchParams: { order_by: 'updated' } },
      httpErrors: httpErrorsFor('project not found'),
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
      { pre: includePrereleases },
    )
  }

  async handle(
    { project },
    {
      gitlab_url: baseUrl = 'https://gitlab.com',
      include_prereleases: pre,
      sort,
    },
  ) {
    const tags = await this.fetch({ project, baseUrl })
    const version = this.constructor.transform({
      tags,
      sort,
      includePrereleases: pre !== undefined,
    })
    return renderVersionBadge({ version })
  }
}
