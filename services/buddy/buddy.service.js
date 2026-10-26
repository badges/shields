import Joi from 'joi'
import { renderBuildStatusBadge } from '../build-status.js'
import { BaseJsonService, pathParam, queryParam } from '../index.js'

const schema = Joi.object({
  executions: Joi.array()
    .items(Joi.object({ status: Joi.string().required() }))
    .default([]),
}).required()

const queryParamSchema = Joi.object({ token: Joi.string() }).required()

const tokenDescription = `
This badge requires a <b>Buddy personal API token</b>.

Create one in your Buddy workspace settings (Settings > API Tokens) and read the
<a target="_blank" href="https://buddy.works/docs/api">API documentation</a> for details.
`

class Buddy extends BaseJsonService {
  static category = 'build'
  static route = {
    base: 'buddy',
    pattern: ':workspace/:project/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/buddy/{workspace}/{project}': {
      get: {
        summary: 'Buddy CI',
        parameters: [
          pathParam({ name: 'workspace', example: 'acme' }),
          pathParam({ name: 'project', example: 'cool-project' }),
          queryParam({
            name: 'token',
            example: 'abc123def456',
            description: tokenDescription,
          }),
        ],
      },
    },
    '/buddy/{workspace}/{project}/{branch}': {
      get: {
        summary: 'Buddy CI (branch)',
        parameters: [
          pathParam({ name: 'workspace', example: 'acme' }),
          pathParam({ name: 'project', example: 'cool-project' }),
          pathParam({ name: 'branch', example: 'main' }),
          queryParam({
            name: 'token',
            example: 'abc123def456',
            description: tokenDescription,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'build' }

  async fetch({ workspace, project, branch }, { token }) {
    const url = `https://api.buddy.works/workspaces/${workspace}/projects/${project}/executions`
    return this._requestJson({
      schema,
      url,
      options: {
        headers: { Authorization: `Bearer ${token}` },
        searchParams: branch ? { branch } : {},
      },
      httpErrors: {
        401: 'invalid token',
        403: 'invalid token',
        404: 'project not found',
      },
    })
  }

  async handle({ workspace, project, branch }, { token }) {
    const { executions } = await this.fetch(
      { workspace, project, branch },
      { token },
    )
    const latest = executions[0]?.status
    const status =
      latest === 'SUCCESSFUL'
        ? 'passing'
        : latest === 'FAILED'
          ? 'failing'
          : 'pending'
    return renderBuildStatusBadge({ status })
  }
}

export default Buddy
