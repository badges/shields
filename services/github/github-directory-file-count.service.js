'use strict'

const path = require('path')
const Joi = require('joi')
const { InvalidParameter } = require('..')
const { ConditionalGithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.alternatives(
  Joi.object({}).required(),
  Joi.array()
    .items(
      Joi.object({
        path: Joi.string().required(),
        type: Joi.string().required(),
      })
    )
    .required()
)

const queryParamSchema = Joi.object({
  type: Joi.any().valid('dir', 'file'),
  extension: Joi.string(),
})

module.exports = class GithubDirectoryFileCount extends ConditionalGithubAuthV3Service {
  static category = 'size'

  static route = {
    base: 'github/directory-file-count',
    pattern: ':user/:repo/:path*',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub repo directory file count',
      pattern: ':user/:repo/:path',
      namedParams: { user: 'badges', repo: 'shields', path: 'services' },
      staticPreview: this.render({ count: 10 }),
      documentation,
    },
    {
      title: 'GitHub repo directory file count (dir type)',
      pattern: ':user/:repo/:path',
      namedParams: { user: 'badges', repo: 'shields', path: 'services' },
      queryParams: { type: 'dir' },
      staticPreview: this.render({ count: 8 }),
      documentation,
    },
    {
      title: 'GitHub repo directory file count (file type)',
      pattern: ':user/:repo/:path',
      namedParams: { user: 'badges', repo: 'shields', path: 'services' },
      queryParams: { type: 'file' },
      staticPreview: this.render({ count: 2 }),
      documentation,
    },
    {
      title: 'GitHub repo directory file count (file extension)',
      pattern: ':user/:repo/:path',
      namedParams: { user: 'badges', repo: 'shields', path: 'services' },
      queryParams: { extension: 'js' },
      staticPreview: this.render({ count: 1 }),
      documentation,
    },
  ]

  static defaultBadgeData = { color: 'blue', label: 'files' }

  static render({ count }) {
    return {
      message: count,
    }
  }

  async fetch({ user, repo, path = '' }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/contents/${path}`,
      schema,
      errorMessages: errorMessagesFor('repo or directory not found'),
    })
  }

  static transform(files, { type, extension }) {
    if (type) {
      files = files.filter(file => file.type === type)
    }
    if (extension) {
      files = files.filter(file => path.extname(file.path) === `.${extension}`)
    }
    return {
      count: files.length,
    }
  }

  async handle({ user, repo, path }, { type, extension }) {
    const content = await this.fetch({ user, repo, path })
    if (!Array.isArray(content)) {
      throw new InvalidParameter({ prettyMessage: 'not a directory' })
    }
    const { count } = this.constructor.transform(content, { type, extension })
    return this.constructor.render({ count })
  }
}
