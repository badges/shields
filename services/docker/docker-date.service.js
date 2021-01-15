'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService, NotFound } = require('..')
const { formatRelativeDate } = require('../text-formatters')
const {
  buildDockerUrl,
  getDockerHubUser,
  getMultiPageData,
} = require('./docker-helpers')

const buildSchema = Joi.object({
  count: nonNegativeInteger.required(),
  results: Joi.array().items(
    Joi.object({
      last_updated: Joi.date().iso().required(),
      name: Joi.string().required(),
      images: Joi.array().items(
        Joi.object({
          digest: Joi.string(),
          architecture: Joi.string().required(),
        })
      ),
    })
  ),
}).required()

const queryParamSchema = Joi.object({
  arch: Joi.string()
    // Valid architecture values: https://golang.org/doc/install/source#environment (GOARCH)
    .valid(
      'amd64',
      'arm',
      'arm64',
      's390x',
      '386',
      'ppc64',
      'ppc64le',
      'wasm',
      'mips',
      'mipsle',
      'mips64',
      'mips64le'
    )
    .default('amd64'),
}).required()

module.exports = class DockerDate extends BaseJsonService {
  static category = 'version'
  static route = { ...buildDockerUrl('date', true), queryParamSchema }
  static examples = [
    {
      title: 'Docker Image Date (latest)',
      pattern: ':user/:repo',
      namedParams: { user: '_', repo: 'alpine' },
      queryParams: { arch: 'amd64' },
      staticPreview: this.render({
        version: new Date(new Date() - 2 * 24 * 60 * 60 * 1000),
      }),
    },
    {
      title: 'Docker Image Date (tag)',
      pattern: ':user/:repo/:tag',
      namedParams: { user: '_', repo: 'alpine', tag: '3.6' },
      staticPreview: this.render({
        version: new Date(new Date() - 3 * 24 * 60 * 60 * 1000),
      }),
    },
  ]

  static defaultBadgeData = { label: 'latest docker image', color: 'blue' }

  static render({ version }) {
    return {
      label: undefined,
      message: formatRelativeDate(version),
      color: 'blue',
    }
  }

  async fetch({ user, repo, page }) {
    page = page ? `&page=${page}` : ''
    return this._requestJson({
      schema: buildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user
      )}/${repo}/tags?page_size=100&ordering=last_updated${page}`,
      errorMessages: { 404: 'repository or tag not found' },
    })
  }

  transform({ tag, data, arch = 'amd64' }) {
    let version
    if (!tag) {
      version = data[0]
    } else {
      version = data.find(d => d.name === tag)
    }
    if (!version) {
      throw new NotFound({ prettyMessage: 'tag not found' })
    }
    return { version: version.last_updated }
  }

  async handle({ user, repo, tag }, { arch }) {
    let data

    data = (await this.fetch({ user, repo })).results
    if (data.count === 0) {
      throw new NotFound({ prettyMessage: 'repository not found' })
    }
    if (tag && !data.find(d => d.name === tag)) {
      data = await getMultiPageData({
        user,
        repo,
        fetch: this.fetch.bind(this),
      })
    }

    const { version } = await this.transform({
      tag,
      data,
      arch,
    })
    return this.constructor.render({ version })
  }
}
