import Joi from 'joi'
import { renderBuildStatusBadge } from '../build-status.js'
import { BaseJsonService, NotFound, pathParams, queryParam } from '../index.js'

const stateStatusMap = {
  succeeded: 'passing',
  failed: 'failing',
  canceled: 'cancelled',
  skipped: 'skipped',
  importing: 'building',
  pending: 'building',
  starting: 'building',
  running: 'building',
  waiting: 'building',
  forked: 'passing',
}

const schema = Joi.object({
  builds: Joi.object({
    latest: Joi.object({
      state: Joi.string().required(),
    }).required(),
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  server: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional(),
}).required()

const description = `
[COPR](https://copr.fedorainfracloud.org/) is a build system for creating RPM packages.

For group projects, prefix the owner with \`@\` (for example \`@copr\`).

The [Copr API v3 documentation](https://copr.fedorainfracloud.org/api_3/docs/) does not
document request rate limits for read-only endpoints. This badge issues one GET per
render to \`/api_3/package\` with \`with_latest_build=True\`.
`

export default class Copr extends BaseJsonService {
  static category = 'build'

  static route = {
    base: 'copr/build',
    pattern: ':owner/:project/:package',
    queryParamSchema,
  }

  static openApi = {
    '/copr/build/{owner}/{project}/{package}': {
      get: {
        summary: 'Copr Build',
        description,
        parameters: [
          ...pathParams(
            {
              name: 'owner',
              example: 'msuchy',
              description:
                'Project owner. For group projects, prefix with `@`.',
            },
            {
              name: 'project',
              example: 'nanoblogger',
            },
            {
              name: 'package',
              example: 'nanoblogger',
            },
          ),
          queryParam({
            name: 'server',
            example: 'https://copr.fedorainfracloud.org',
            description:
              'Copr server URL. Defaults to `https://copr.fedorainfracloud.org`.',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'build' }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  packageUrl({ server, owner, project, package: packageName }) {
    const trimmedServer = server.replace(/\/$/, '')
    return `${trimmedServer}/api_3/package`
  }

  async fetch({ server, owner, project, package: packageName }) {
    return this._requestJson({
      schema,
      url: this.packageUrl({ server, owner, project, package: packageName }),
      options: {
        searchParams: {
          ownername: owner,
          projectname: project,
          packagename: packageName,
          with_latest_build: 'True',
        },
      },
      httpErrors: {
        404: 'project or package not found',
      },
    })
  }

  transform({ builds }) {
    const { state } = builds.latest
    const status = stateStatusMap[state]
    if (!status) {
      throw new NotFound({ prettyMessage: 'unknown build state' })
    }
    return { status }
  }

  async handle(
    { owner, project, package: packageName },
    { server = 'https://copr.fedorainfracloud.org' },
  ) {
    const json = await this.fetch({
      server,
      owner,
      project,
      package: packageName,
    })
    const { status } = this.transform(json)
    return this.constructor.render({ status })
  }
}
