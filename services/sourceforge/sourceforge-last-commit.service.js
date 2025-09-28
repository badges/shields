import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { renderDateBadge } from '../date.js'

const schema = Joi.object({
  commits: Joi.array()
    .items(
      Joi.object({
        committed_date: Joi.string().required(),
      }).required(),
    )
    .required(),
}).required()

export default class SourceforgeLastCommit extends BaseJsonService {
  static category = 'activity'

  static route = {
    base: 'sourceforge/last-commit',
    pattern: ':project/:repo',
  }

  static openApi = {
    '/sourceforge/last-commit/{project}/{repo}': {
      get: {
        summary: 'SourceForge Last Commit',
        parameters: pathParams(
          {
            name: 'project',
            example: 'guitarix',
          },
          {
            name: 'repo',
            example: 'git',
            description:
              'The repository name, usually `git` but might be different.',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'last commit' }

  async fetch({ project, repo }) {
    return this._requestJson({
      url: `https://sourceforge.net/rest/p/${project}/${repo}/commits`,
      schema,
      httpErrors: {
        404: 'project or repo not found',
      },
    })
  }

  async handle({ project, repo }) {
    const body = await this.fetch({ project, repo })
    return renderDateBadge(body.commits[0].committed_date)
  }
}
