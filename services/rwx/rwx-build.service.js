import Joi from 'joi'
import { BaseJsonService, pathParam, queryParam } from '../index.js'

const responseSchema = Joi.object({
  schemaVersion: Joi.number().valid(1).required(),
  label: Joi.string().required(),
  message: Joi.string().required(),
  color: Joi.string().required(),
}).required()

const queryParamSchema = Joi.object({
  repo: Joi.string().required(),
  branch: Joi.string().required(),
  definition: Joi.string().required(),
  token: Joi.string(),
  label: Joi.string().max(100),
}).required()

const tokenDescription = `
Optional org-scoped status badge token. Required for private repositories.

Manage tokens in your [RWX Org Settings](https://cloud.rwx.com/org/deep_link/manage/mint/status_badge_tokens).
<b>Status badge tokens are read-only and grant access only to badge data.</b>
`

export default class RwxBuild extends BaseJsonService {
  static category = 'build'

  static route = {
    base: 'rwx/build',
    pattern: ':organizationSlug',
    queryParamSchema,
  }

  static openApi = {
    '/rwx/build/{organizationSlug}': {
      get: {
        summary: 'RWX Latest Run Status',
        description:
          '[RWX](https://www.rwx.com/) is a CI/CD platform. This badge reports the status of the most recent run for a given repository, branch, and run definition.',
        parameters: [
          pathParam({
            name: 'organizationSlug',
            example: 'rwx',
            description: 'RWX organization slug',
          }),
          queryParam({
            name: 'repo',
            example: 'rwx',
            required: true,
            description: 'Repository, without the owner/org prefix.',
          }),
          queryParam({
            name: 'branch',
            example: 'main',
            required: true,
          }),
          queryParam({
            name: 'definition',
            example: '.rwx/main.yml',
            required: true,
            description:
              'Path to the RWX run definition file, relative to the repository root.',
          }),
          queryParam({
            name: 'token',
            example: '0123456789abcdef0123456789abcdef',
            description: tokenDescription,
          }),
          queryParam({
            name: 'label',
            example: 'ci',
            description: 'Override the default `build` label.',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'build' }

  async handle(
    { organizationSlug },
    { repo, branch, definition, token, label },
  ) {
    const searchParams = { repo, branch, definition }
    if (token) {
      searchParams.token = token
    }
    if (label) {
      searchParams.label = label
    }

    const {
      label: respLabel,
      message,
      color,
    } = await this._requestJson({
      schema: responseSchema,
      url: `https://cloud.rwx.com/status_badges/${encodeURIComponent(
        organizationSlug,
      )}.json`,
      options: { searchParams },
    })

    return { label: respLabel, message, color }
  }
}
