'use strict'

const Joi = require('@hapi/joi')
const prettyBytes = require('pretty-bytes')
const { anyInteger } = require('../validators')
const { buildDockerUrl, getDockerHubUser } = require('./docker-helpers')
const { BaseJsonService } = require('..')
const { NotFound } = require('..')

const buildSchema = Joi.object({
  results: Joi.array()
    .items(Joi.object({ name: Joi.string(), full_size: anyInteger }).required())
    .required(),
}).required()

module.exports = class DockerSize extends BaseJsonService {
  static get category() {
    return 'size'
  }

  static get route() {
    return buildDockerUrl('image-size')
  }

  static get examples() {
    return [
      {
        title: 'Docker Image Size',
        pattern: ':user/:repo',
        namedParams: { user: 'fedora', repo: 'apache' },
        staticPreview: this.render({ size: 126000000 }),
      },
      {
        title: 'Docker Image Size (tag)',
        pattern: ':user/:repo/:tag',
        namedParams: { user: 'fedora', repo: 'apache', tag: 'latest' },
        staticPreview: this.render({ size: 103000000 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'image size' }
  }

  static render({ size }) {
    return {
      message: prettyBytes(parseInt(size)),
      color: 'blue',
    }
  }

  async fetch({ user, repo, page }) {
    page = (page && `&page=${page}`) || ''
    return this._requestJson({
      schema: buildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user
      )}/${repo}/tags?page_size=100&ordering=last_updated${page}`,
    })
  }

  async handle({ user, repo, tag = 'latest' }) {
    const data = await this.fetch({ user, repo })
    const size = data.results.find(r => r.name === tag)
    if (size) return this.constructor.render({ size: size.full_size })
    throw new NotFound({ prettyMessage: 'unknown' })
  }
}
