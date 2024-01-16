import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { latest, renderVersionBadge } from '../version.js'
import { NotFound, pathParam, queryParam } from '../index.js'
import { description, httpErrorsFor } from './gitlab-helper.js'
import GitLabBase from './gitlab-base.js'

const schema = Joi.array().items(
  Joi.object({
    name: Joi.string().required(),
    tag_name: Joi.string().required(),
  }),
)

const sortEnum = ['date', 'semver']
const displayNameEnum = ['tag', 'release']
const dateOrderByEnum = ['created_at', 'released_at']

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
  include_prereleases: Joi.equal(''),
  sort: Joi.string()
    .valid(...sortEnum)
    .default('date'),
  display_name: Joi.string()
    .valid(...displayNameEnum)
    .default('tag'),
  date_order_by: Joi.string()
    .valid(...dateOrderByEnum)
    .default('created_at'),
}).required()

export default class GitLabRelease extends GitLabBase {
  static category = 'version'

  static route = {
    base: 'gitlab/v/release',
    pattern: ':project+',
    queryParamSchema,
  }

  static openApi = {
    '/gitlab/v/release/{project}': {
      get: {
        summary: 'GitLab Release',
        description,
        parameters: [
          pathParam({
            name: 'project',
            example: 'gitlab-org/gitlab',
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
          queryParam({
            name: 'display_name',
            schema: { type: 'string', enum: displayNameEnum },
            example: 'release',
          }),
          queryParam({
            name: 'date_order_by',
            schema: { type: 'string', enum: dateOrderByEnum },
            example: 'created_at',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'release' }

  async fetch({ project, baseUrl, isSemver, orderBy }) {
    // https://docs.gitlab.com/ee/api/releases/
    return this.fetchPaginatedArrayData({
      schema,
      url: `${baseUrl}/api/v4/projects/${encodeURIComponent(project)}/releases`,
      httpErrors: httpErrorsFor('project not found'),
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
      { pre: includePrereleases },
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
    },
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
