import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { url } from '../validators.js'
import { BaseJsonService, NotFound, pathParams, queryParams } from '../index.js'

const searchApiSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        version: Joi.string().required(),
      }),
    )
    .required(),
}).required()

const queryParamSchema = Joi.object({
  server: url,
  queryOpt: Joi.string()
    .regex(/(:[\w.]+=[^:]*)+/i)
    .optional(),
}).required()

const openApiQueryParams = queryParams(
  { name: 'server', example: 'https://repo.tomkeuper.com', required: true },
  {
    name: 'queryOpt',
    example: ':c=agent-apple-osx:p=tar.gz',
    description: `
Note that you can use query options with any Nexus badge type (Releases, Snapshots, or Repository).

Query options should be provided as key=value pairs separated by a colon.

Possible values: <a href="https://help.sonatype.com/en/searching-for-components.html">Searching for Component</a>
`,
  },
)

export default class Nexus extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'nexus',
    pattern: ':repo(r|s|[^/]+)/:groupId/:artifactId',
    queryParamSchema,
  }

  static auth = {
    userKey: 'nexus_user',
    passKey: 'nexus_pass',
    serviceKey: 'nexus',
  }

  static openApi = {
    '/nexus/r/{groupId}/{artifactId}': {
      get: {
        summary: 'Sonatype Nexus (Releases)',
        parameters: [
          ...pathParams(
            { name: 'groupId', example: 'com.google.guava' },
            { name: 'artifactId', example: 'guava' },
          ),
          ...openApiQueryParams,
        ],
      },
    },
    '/nexus/s/{groupId}/{artifactId}': {
      get: {
        summary: 'Sonatype Nexus (Snapshots)',
        parameters: [
          ...pathParams(
            { name: 'groupId', example: 'com.google.guava' },
            { name: 'artifactId', example: 'guava' },
          ),
          ...openApiQueryParams,
        ],
      },
    },
    '/nexus/{repo}/{groupId}/{artifactId}': {
      get: {
        summary: 'Sonatype Nexus (Repository)',
        parameters: [
          ...pathParams(
            { name: 'repo', example: 'maven-central' },
            { name: 'groupId', example: 'com.google.guava' },
            { name: 'artifactId', example: 'guava' },
          ),
          ...openApiQueryParams,
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'nexus',
  }

  addQueryParamsToQueryString({ searchParams, queryOpt }) {
    // Users specify query options with 'key=value' pairs, using a
    // colon delimiter between pairs ([:k1=v1[:k2=v2[...]]]).
    // queryOpt will be a string containing those key/value pairs,
    // For example:  :c=agent-apple-osx:p=tar.gz
    const keyValuePairs = queryOpt.split(':')
    keyValuePairs.forEach(keyValuePair => {
      const paramParts = keyValuePair.split('=')
      const paramKey = paramParts[0]
      const paramValue = paramParts[1]
      searchParams[paramKey] = paramValue
    })
  }

  async fetch({ server, repo, groupId, artifactId, queryOpt }) {
    const searchParams = {
      group: groupId,
      name: artifactId,
      sort: 'version',
    }

    switch (repo) {
      case 's':
        searchParams.prerelease = 'true'
        break
      case 'r':
        searchParams.prerelease = 'false'
        break
      default:
        searchParams.repository = repo
        break
    }

    if (queryOpt) {
      this.addQueryParamsToQueryString({ searchParams, queryOpt })
    }

    const url = `${server}${
      server.slice(-1) === '/' ? '' : '/'
    }service/rest/v1/search`

    const json = await this._requestJson(
      this.authHelper.withBasicAuth({
        schema: searchApiSchema,
        url,
        options: { searchParams },
        httpErrors: {
          404: 'artifact not found',
        },
      }),
    )

    return { json }
  }

  transform({ repo, json }) {
    if (json.items.length === 0) {
      const versionType = repo === 's' ? 'snapshot ' : ''
      throw new NotFound({
        prettyMessage: `artifact or ${versionType}version not found`,
      })
    }
    return { version: json.items[0].version }
  }

  async handle({ repo, groupId, artifactId }, { server, queryOpt }) {
    const { json } = await this.fetch({
      repo,
      server,
      groupId,
      artifactId,
      queryOpt,
    })

    const { version } = this.transform({ repo, json })
    return renderVersionBadge({ version })
  }
}
