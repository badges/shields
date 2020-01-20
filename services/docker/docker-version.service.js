'use strict'

const Joi = require('@hapi/joi')
const { anyInteger } = require('../validators')
const { buildDockerUrl, getDockerHubUser } = require('./docker-helpers')
const { BaseJsonService } = require('..')
const { NotFound } = require('..')

const buildSchema = Joi.object({
  results: Joi.array()
    .items(
      Joi.object({
        name: Joi.string(),
        full_size: anyInteger,
        images: Joi.array().items(
          Joi.object({
            digest: Joi.string(),
            architecture: Joi.string(),
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
    return buildDockerUrl('version')
  }

  static get examples() {
    return [
      {
        title: 'Docker Image Version',
        pattern: ':user/:repo',
        namedParams: { user: '_', repo: 'alpine' },
        staticPreview: this.render({ version: '3.11.2' }),
      },
      {
        title: 'Docker Image Version (tag)',
        pattern: ':user/:repo/:tag',
        namedParams: { user: '_', repo: 'alpine', tag: '3.10' },
        staticPreview: this.render({ version: '3.10.3' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'version' }
  }

  static render({ version }) {
    return {
      message: version,
      color: 'blue',
    }
  }

  async fetch({ user, repo }) {
    return this._requestJson({
      schema: buildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user
      )}/${repo}/tags?page_size=10000`,
    })
  }

  async handle({ user, repo, tag = 'latest' }) {
    const data = await this.fetch({ user, repo })
    const version = data.results.find(r => r.name === tag)
    if (!version) throw new NotFound({ prettyMessage: 'unknown' })
    const { digest } = version.images.find(i => i.architecture === 'amd64')
    const versions = data.results
      .filter(r => r.images.some(i => i.digest === digest))
      .map(result => result.name)
    let explicitSemVer = versions[0]
    versions.forEach(name => {
      const dots = (name.match(/\./g) || []).length
      const olddots = (explicitSemVer.match(/\./g) || []).length
      explicitSemVer =
        dots >= olddots && name !== 'latest' ? name : explicitSemVer
    })
    return this.constructor.render({ version: explicitSemVer })
  }
}
