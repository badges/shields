'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const { latest } = require('../version')
const {
  buildDockerUrl,
  getDockerHubUser,
  getMultiPageData,
  getDigestMatches,
} = require('./docker-helpers')
const { BaseJsonService } = require('..')
const { NotFound } = require('..')

const buildSchema = Joi.object({
  count: nonNegativeInteger.required(),
  results: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        images: Joi.array().items(
          Joi.object({
            digest: Joi.string(),
            architecture: Joi.string().required(),
          })
        ),
      }).required()
    )
    .required(),
}).required()

module.exports = class DockerVersion extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return buildDockerUrl('version', true, true)
  }

  static get examples() {
    return [
      {
        title: 'Docker Image Version (latest by date)',
        pattern: ':user/:repo',
        namedParams: { user: '_', repo: 'alpine' },
        staticPreview: this.render({ version: '3.9.5', sort: 'date' }),
      },
      {
        title: 'Docker Image Version (latest SemVer)',
        pattern: ':user/:repo',
        namedParams: { user: '_', repo: 'alpine' },
        queryParams: { sort: 'semver' },
        staticPreview: this.render({ version: '3.11.3' }),
      },
      {
        title: 'Docker Image Version (tag latest by date)',
        pattern: ':user/:repo/:tag',
        namedParams: { user: '_', repo: 'alpine', tag: '3.10' },
        staticPreview: this.render({ version: '3.10.4', sort: 'date' }),
      },
      {
        title: 'Docker Image Version (tag latest SemVer)',
        pattern: ':user/:repo/:tag',
        namedParams: { user: '_', repo: 'alpine', tag: '3.6' },
        queryParams: { sort: 'semver' },
        staticPreview: this.render({ version: '3.6.5' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'version',
      color: 'blue',
    }
  }

  static render({ version }) {
    return { message: version }
  }

  async fetch({ user, repo, page }) {
    page = page ? `&page=${page}` : ''
    return this._requestJson({
      schema: buildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user
      )}/${repo}/tags?page_size=100&ordering=last_updated${page}`,
      errorMessages: { 404: 'image or tag not found' },
    })
  }

  async handle({ user, repo, tag }, { sort }) {
    let data = []
    let matches = []
    let version = ''
    if (!tag && sort === 'date') {
      data = await this.fetch({ user, repo })
      version = data.results[0].name
      if (version === 'latest') {
        const { digest } = data.results[0].images.find(
          i => i.architecture === 'amd64'
        ) // Digest is the unique field that we utilise to match images
        data = await getMultiPageData({
          user,
          repo,
          fetch: this.fetch.bind(this),
        })
        matches = getDigestMatches({ data, digest })
        version = latest(matches)
      }
    } else if (!tag && sort === 'semver') {
      data = await getMultiPageData({
        user,
        repo,
        fetch: this.fetch.bind(this),
      })
      matches = data.map(d => d.name)
      version = latest(matches)
    } else if (tag && sort === 'date') {
      data = await getMultiPageData({
        user,
        repo,
        fetch: this.fetch.bind(this),
      })
      version = data.find(d => d.name === tag)
      if (!version) {
        throw new NotFound({ prettyMessage: 'no tags found' })
      }
      const { digest } = version.images.find(i => i.architecture === 'amd64')
      data = await getMultiPageData({
        user,
        repo,
        fetch: this.fetch.bind(this),
      })
      matches = getDigestMatches({ data, digest })
      version = latest(matches)
    } else {
      data = await getMultiPageData({
        user,
        repo,
        fetch: this.fetch.bind(this),
      })
      version = data.find(d => d.name === tag)
      if (!version) {
        throw new NotFound({ prettyMessage: 'no tags found' })
      }
      const { digest } = version.images.find(i => i.architecture === 'amd64')
      matches = getDigestMatches({ data, digest })
      version = latest(matches)
    }
    return this.constructor.render({ version })
  }
}
