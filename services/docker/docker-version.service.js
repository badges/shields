'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const { latest, renderVersionBadge } = require('../version')
const {
  buildDockerUrl,
  getDockerHubUser,
  getMultiPageData,
  getDigestSemVerMatches,
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

const queryParamSchema = Joi.object({
  sort: Joi.string()
    .valid('date', 'semver')
    .default('date'),
}).required()

module.exports = class DockerVersion extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return { ...buildDockerUrl('version', true), queryParamSchema }
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
        title: 'Docker Image Version (tag latest SemVer)',
        pattern: ':user/:repo/:tag',
        namedParams: { user: '_', repo: 'alpine', tag: '3.6' },
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
    return renderVersionBadge({ version })
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

  async transform({ user, repo, tag, data }, { sort }) {
    let version = ''

    if (!tag && sort === 'date') {
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
        version = getDigestSemVerMatches({ data, digest })
      }
    } else if (!tag && sort === 'semver') {
      const matches = data.map(d => d.name)
      version = latest(matches)
    } else {
      version = data.find(d => d.name === tag)
      if (!version) {
        throw new NotFound({ prettyMessage: 'no tags found' })
      }
      const { digest } = version.images.find(i => i.architecture === 'amd64')
      version = getDigestSemVerMatches({ data, digest })
    }
    return version
  }

  async handle({ user, repo, tag }, { sort }) {
    let data = []

    if (!tag && sort === 'date') {
      data = await this.fetch({ user, repo })
    } else {
      data = await getMultiPageData({
        user,
        repo,
        fetch: this.fetch.bind(this),
      })
    }

    const version = await this.transform({ user, repo, tag, data }, { sort })
    return this.constructor.render({ version })
  }
}
