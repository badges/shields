'use strict'

const Joi = require('@hapi/joi')
const prettyBytes = require('pretty-bytes')
const { nonNegativeInteger } = require('../validators')
const { buildDockerUrl, getDockerHubUser } = require('./docker-helpers')
const { BaseJsonService } = require('..')

const buildSchema = Joi.object({
  name: Joi.string().required(),
  full_size: nonNegativeInteger.required(),
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
    return {
      label: 'image size',
      color: 'blue',
    }
  }

  static render({ size }) {
    return { message: prettyBytes(size) }
  }

  async fetch({ user, repo, tag }) {
    return this._requestJson({
      schema: buildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user
      )}/${repo}/tags/${tag}`,
      errorMessages: { 404: 'image or tag not found' },
    })
  }

  async handle({ user, repo, tag = 'latest' }) {
    const data = await this.fetch({ user, repo, tag })
    return this.constructor.render({ size: data.full_size })
  }
}
