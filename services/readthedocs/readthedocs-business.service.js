import { renderBuildStatusBadge } from '../build-status.js'
import { BaseJsonService, pathParams } from '../index.js'
import { fetchBuildStatus, statusFromResults } from './readthedocs-common.js'

const description =
  '[Read the Docs for Business](https://about.readthedocs.com/) hosts documentation on `readthedocs.com`, including commercial projects. Public projects work without a token. Private projects need an API token configured as `readthedocs_com_token` on the Shields server; badge URLs themselves do not accept a token.'

export default class ReadTheDocsBusiness extends BaseJsonService {
  static category = 'build'

  static route = {
    base: 'readthedocs.com',
    pattern: ':project/:version?',
  }

  static auth = {
    passKey: 'readthedocs_com_token',
    authorizedOrigins: ['https://app.readthedocs.com'],
  }

  static openApi = {
    '/readthedocs.com/{packageName}': {
      get: {
        summary: 'Read the Docs (business)',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'dkistdc-dkist',
        }),
      },
    },
    '/readthedocs.com/{packageName}/{version}': {
      get: {
        summary: 'Read the Docs (business, version)',
        description,
        parameters: pathParams(
          {
            name: 'packageName',
            example: 'dkistdc-dkist',
          },
          {
            name: 'version',
            example: 'latest',
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
    return fetchBuildStatus(this, { domain: 'com', project, version })
  }

  async handle({ project, version }) {
    const { results } = await this.fetch({ project, version })
    return this.constructor.render({
      status: statusFromResults(results),
    })
  }
}
