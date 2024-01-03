import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl } from '../validators.js'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
import { description, httpErrorsFor } from './gitlab-helper.js'
import GitLabBase from './gitlab-base.js'

const schema = Joi.array()
  .items(
    Joi.object({
      committed_date: Joi.string().required(),
    }).required(),
  )
  .required()
  .min(1)

const queryParamSchema = Joi.object({
  ref: Joi.string(),
  gitlab_url: optionalUrl,
}).required()

const refText = `
<p>
  ref can be filled with the name of a branch, tag or revision range of the repository.
</p>
`

const lastCommitDescription = description + refText

export default class GitlabLastCommit extends GitLabBase {
  static category = 'activity'

  static route = {
    base: 'gitlab/last-commit',
    pattern: ':project+',
    queryParamSchema,
  }

  static openApi = {
    '/gitlab/last-commit/{project}': {
      get: {
        summary: 'GitLab Last Commit',
        description: lastCommitDescription,
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
            name: 'ref',
            example: 'master',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'last commit' }

  static render({ commitDate }) {
    return {
      message: formatDate(commitDate),
      color: ageColor(Date.parse(commitDate)),
    }
  }

  async fetch({ project, baseUrl, ref }) {
    // https://docs.gitlab.com/ee/api/commits.html#list-repository-commits
    return super.fetch({
      url: `${baseUrl}/api/v4/projects/${encodeURIComponent(
        project,
      )}/repository/commits`,
      options: { searchParams: { ref_name: ref } },
      schema,
      httpErrors: httpErrorsFor('project not found'),
    })
  }

  async handle(
    { project },
    { gitlab_url: baseUrl = 'https://gitlab.com', ref },
  ) {
    const data = await this.fetch({ project, baseUrl, ref })
    return this.constructor.render({ commitDate: data[0].committed_date })
  }
}
