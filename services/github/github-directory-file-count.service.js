import Joi from 'joi'
import gql from 'graphql-tag'
import { metric } from '../text-formatters.js'
import { InvalidParameter } from '../index.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import {
  documentation as commonDocumentation,
  transformErrors,
} from './github-helpers.js'

const documentation = `${commonDocumentation}
<p>
  <b>Note:</b><br>
  1. Parameter <code>type</code> accepts either <code>file</code> or <code>dir</code> value. Passing any other value will result in an error.<br>
  2. Parameter <code>extension</code> accepts file extension without a leading dot.
     For instance for <code>.js</code> extension pass <code>js</code>.
     Only single <code>extension</code> value can be specified.
     <code>extension</code> is applicable for <code>type</code> <code>file</code> only.
     Passing it either without <code>type</code> or along with <code>type</code> <code>dir</code> will result in an error.<br>
  3. GitHub API has an upper limit of 1,000 files for a directory.
     In case a directory contains files above the limit, a badge might present inaccurate information.<br>
</p>
`

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      object: Joi.object({
        entries: Joi.array().items(
          Joi.object({
            type: Joi.string().required(),
            extension: Joi.string().allow('').required(),
          })
        ),
      })
        .allow(null)
        .required(),
    }).required(),
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  type: Joi.any().valid('dir', 'file'),
  extension: Joi.string(),
})

export default class GithubDirectoryFileCount extends GithubAuthV4Service {
  static category = 'size'

  static route = {
    base: 'github/directory-file-count',
    pattern: ':user/:repo/:path*',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub repo file count',
      pattern: ':user/:repo',
      namedParams: { user: 'badges', repo: 'shields' },
      staticPreview: this.render({ count: 20 }),
      documentation,
    },
    {
      title: 'GitHub repo file count (custom path)',
      pattern: ':user/:repo/:path',
      namedParams: { user: 'badges', repo: 'shields', path: 'services' },
      staticPreview: this.render({ count: 10 }),
      documentation,
    },
    {
      title: 'GitHub repo directory count',
      pattern: ':user/:repo',
      namedParams: { user: 'badges', repo: 'shields' },
      queryParams: { type: 'dir' },
      staticPreview: this.render({ count: 8 }),
      documentation,
    },
    {
      title: 'GitHub repo directory count (custom path)',
      pattern: ':user/:repo/:path',
      namedParams: { user: 'badges', repo: 'shields', path: 'services' },
      queryParams: { type: 'dir' },
      staticPreview: this.render({ count: 8 }),
      documentation,
    },
    {
      title: 'GitHub repo file count (file type)',
      pattern: ':user/:repo',
      namedParams: { user: 'badges', repo: 'shields' },
      queryParams: { type: 'file' },
      staticPreview: this.render({ count: 2 }),
      documentation,
    },
    {
      title: 'GitHub repo file count (custom path & file type)',
      pattern: ':user/:repo/:path',
      namedParams: { user: 'badges', repo: 'shields', path: 'services' },
      queryParams: { type: 'file' },
      staticPreview: this.render({ count: 2 }),
      documentation,
    },
    {
      title: 'GitHub repo file count (file extension)',
      pattern: ':user/:repo/:path',
      namedParams: { user: 'badges', repo: 'shields', path: 'services' },
      queryParams: { type: 'file', extension: 'js' },
      staticPreview: this.render({ count: 1 }),
      documentation,
    },
  ]

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
