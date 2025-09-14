import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { InvalidResponse, pathParam, queryParam } from '../index.js'
import { description, httpErrorsFor } from './gitlab-helper.js'
import GitLabBase from './gitlab-base.js'

const queryParamSchema = Joi.object({
  filename: Joi.string(),
  gitlabUrl: Joi.string(),
}).required()

const goVersionRegExp = /^go ([^/\s]+)(\s*\/.+)?$/m

const filenameDescription =
  'The `filename` param can be used to specify the path to `go.mod`. By default, we look for `go.mod` in the repo root'

export default class GitlabGoModGoVersion extends GitLabBase {
  static category = 'platform-support'
  static route = {
    base: 'gitlab/go-mod/go-version',
    pattern: ':user/:repo/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/gitlab/go-mod/go-version/{user}/{repo}': {
      get: {
        summary: 'GitLab go.mod Go version',
        description,
        parameters: [
          pathParam({
            name: 'user',
            example: 'gitlab-org',
          }),
          pathParam({
            name: 'repo',
            example: 'gitlab-runner',
          }),
          queryParam({
            name: 'filename',
            example: 'src/go.mod',
            description: filenameDescription,
          }),
          queryParam({
            name: 'gitlabUrl',
            example: 'https://gitlab.example.com',
          }),
        ],
      },
    },
    '/gitlab/go-mod/go-version/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitLab go.mod Go version (branch)',
        description,
        parameters: [
          pathParam({
            name: 'user',
            example: 'gitlab-org',
          }),
          pathParam({
            name: 'repo',
            example: 'gitlab-runner',
          }),
          pathParam({
            name: 'branch',
            example: 'main',
          }),
          queryParam({
            name: 'filename',
            example: 'src/go.mod',
            description: filenameDescription,
          }),
          queryParam({
            name: 'gitlabUrl',
            example: 'https://gitlab.example.com',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'Go' }

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'Go',
    })
  }

  async fetch({ user, repo, branch, filename, gitlabUrl }) {
    const project = `${user}/${repo}`
    // https://docs.gitlab.com/ee/api/repository_files.html#get-raw-file-from-repository
    const url = `${gitlabUrl}/api/v4/projects/${encodeURIComponent(
      project,
    )}/repository/files/${encodeURIComponent(filename)}/raw`
    const options = { searchParams: { ref: branch || 'HEAD' } }
    const httpErrors = httpErrorsFor('project or file not found')
    const { buffer } = await this._request(
      this.authHelper.withBearerAuthHeader({
        url,
        options,
        httpErrors,
      }),
    )
    return buffer
  }

  static transform(content) {
    const match = goVersionRegExp.exec(content)
    if (!match) {
      throw new InvalidResponse({
        prettyMessage: 'Go version missing in go.mod',
      })
    }

    return {
      go: match[1],
    }
  }

  async handle(
    { user, repo, branch },
    { filename = 'go.mod', gitlabUrl = 'https://gitlab.com' },
  ) {
    const content = await this.fetch({
      user,
      repo,
      branch,
      filename,
      gitlabUrl,
    })
    const { go } = this.constructor.transform(content.toString())
    return this.constructor.render({ version: go, branch })
  }
}
