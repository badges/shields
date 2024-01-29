import Joi from 'joi'
import gql from 'graphql-tag'
import { metric } from '../text-formatters.js'
import { InvalidParameter, pathParam, queryParam } from '../index.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { documentation, transformErrors } from './github-helpers.js'

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      object: Joi.object({
        entries: Joi.array().items(
          Joi.object({
            type: Joi.string().required(),
            extension: Joi.string().allow('').required(),
          }),
        ),
      })
        .allow(null)
        .required(),
    }).required(),
  }).required(),
}).required()

const typeEnum = ['dir', 'file']

const queryParamSchema = Joi.object({
  type: Joi.any().valid(...typeEnum),
  extension: Joi.string(),
})

const typeDocs =
  'Entity to count: directories or files. If not specified, both files and directories are counted. GitHub API has an upper limit of 1,000 files for a directory. If a directory contains files above the limit, the badge will show an inaccurate count.'
const extensionDocs =
  'Filter to files of type. Specify the extension without a leading dot. For instance for `.js` extension pass `js`. This param is only applicable if type is `file`'

export default class GithubDirectoryFileCount extends GithubAuthV4Service {
  static category = 'size'

  static route = {
    base: 'github/directory-file-count',
    pattern: ':user/:repo/:path*',
    queryParamSchema,
  }

  static openApi = {
    '/github/directory-file-count/{user}/{repo}': {
      get: {
        summary: 'GitHub repo file or directory count',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          queryParam({
            name: 'type',
            example: 'file',
            schema: { type: 'string', enum: typeEnum },
            description: typeDocs,
          }),
          queryParam({
            name: 'extension',
            example: 'js',
            description: extensionDocs,
          }),
        ],
      },
    },
    '/github/directory-file-count/{user}/{repo}/{path}': {
      get: {
        summary: 'GitHub repo file or directory count (in path)',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          pathParam({ name: 'path', example: 'services' }),
          queryParam({
            name: 'type',
            example: 'file',
            schema: { type: 'string', enum: typeEnum },
            description: typeDocs,
          }),
          queryParam({
            name: 'extension',
            example: 'js',
            description: extensionDocs,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { color: 'blue', label: 'files' }

  static render({ count }) {
    return {
      message: metric(count),
    }
  }

  async fetch({ user, repo, path = '' }) {
    const expression = `HEAD:${path}`
    return this._requestGraphql({
      query: gql`
        query RepoFiles($user: String!, $repo: String!, $expression: String!) {
          repository(owner: $user, name: $repo) {
            object(expression: $expression) {
              ... on Tree {
                entries {
                  type
                  extension
                }
              }
            }
          }
        }
      `,
      variables: { user, repo, expression },
      schema,
      transformErrors,
    })
  }

  static transform(files, { type, extension }) {
    if (!Array.isArray(files)) {
      throw new InvalidParameter({ prettyMessage: 'not a directory' })
    }

    if (type !== 'file' && extension) {
      throw new InvalidParameter({
        prettyMessage: 'extension is applicable for type file only',
      })
    }

    if (type) {
      const objectType = type === 'dir' ? 'tree' : 'blob'
      files = files.filter(file => file.type === objectType)
    }

    if (extension) {
      files = files.filter(file => file.extension === `.${extension}`)
    }

    return {
      count: files.length,
    }
  }

  async handle({ user, repo, path }, { type, extension }) {
    const json = await this.fetch({ user, repo, path })
    if (json.data.repository.object === null) {
      throw new InvalidParameter({
        prettyMessage: 'directory not found',
      })
    }
    const content = json.data.repository.object.entries
    const { count } = this.constructor.transform(content, { type, extension })
    return this.constructor.render({ count })
  }
}
