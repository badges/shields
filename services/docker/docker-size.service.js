'use strict'

const Joi = require('@hapi/joi')
const prettyBytes = require('pretty-bytes')
const { anyInteger } = require('../validators')
const { buildDockerUrl, getDockerHubUser } = require('./docker-helpers')
const { BaseJsonService } = require('..')
const { NotFound } = require('..')

const buildSchema = Joi.object({
  name: Joi.string(),
  full_size: anyInteger,
}).required()

module.exports = class DockerSize extends BaseJsonService {
  static get category() {
    return 'size'
  }

  static get route() {
    return buildDockerUrl('image-size', true)
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

  async fetch({ user, repo, tag }) {
    return this._requestJson({
      schema: buildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user
      )}/${repo}/tags/${tag}`,
    })
  }

  async handle({ user, repo, tag = 'latest' }) {
    const data = await this.fetch({ user, repo, tag })
    if (data) return this.constructor.render({ size: data.full_size })
    throw new NotFound({ prettyMessage: 'unknown' })
  }
}
