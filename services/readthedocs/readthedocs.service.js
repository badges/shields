import { renderBuildStatusBadge } from '../build-status.js'
import { BaseJsonService, pathParams } from '../index.js'
import { fetchBuildStatus, statusFromResults } from './readthedocs-common.js'

const description =
  '[Read the Docs Community](https://about.readthedocs.com/features/read-the-docs-community/) hosts public documentation. The legacy `/readthedocs/` route redirects here.'

export default class ReadTheDocs extends BaseJsonService {
  static category = 'build'

  static route = {
    base: 'readthedocs.org',
    pattern: ':project/:version?',
  }

  static auth = {
    passKey: 'readthedocs_token',
    authorizedOrigins: ['https://app.readthedocs.org'],
  }

  static openApi = {
    '/readthedocs.org/{packageName}': {
      get: {
        summary: 'Read the Docs',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'pip',
        }),
      },
    },
    '/readthedocs.org/{packageName}/{version}': {
      get: {
        summary: 'Read the Docs (version)',
        description,
        parameters: pathParams(
          {
            name: 'packageName',
            example: 'pip',
          },
          {
            name: 'version',
            example: 'stable',
          },
        ),
      },
    },
  }

  static _cacheLength = 300

  static defaultBadgeData = {
    label: 'docs',
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async fetch({ project, version }) {
    return fetchBuildStatus(this, { domain: 'org', project, version })
  }

  async handle({ project, version }) {
    const { results } = await this.fetch({ project, version })
    return this.constructor.render({
      status: statusFromResults(results),
    })
  }
}
