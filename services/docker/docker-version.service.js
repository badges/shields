'use strict'

const Joi = require('@hapi/joi')
const { anyInteger } = require('../validators')
const { buildDockerUrl, getDockerHubUser } = require('./docker-helpers')
const { BaseJsonService } = require('..')
const { NotFound } = require('..')

const buildSchema = Joi.object({
  count: anyInteger,
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
    /* Initial request to get number of pages */
    const data = []
    data.push(await this.fetch({ user, repo }))
    const numberOfPages = Math.ceil(data[0].count / 100)
    if (numberOfPages) {
      /* Fetch additional page data */
      const pageData = []
      /* Invoke fetch for each page */
      for (let i = 1; numberOfPages > i; ++i) {
        pageData.push(this.fetch({ user, repo, page: i + 1 }))
      }
      /* await each promise */
      for (const promise of pageData) {
        data.push(await promise)
      }
    }
    /* Flatten data.results into a new array */
    let flat = []
    data.forEach(page => {
      flat = flat.concat(page.results)
    })
    /* Find tag specified from lookup */
    const version = flat.find(r => r.name === tag)
    if (!version) throw new NotFound({ prettyMessage: 'unknown' })
    /* Identify sha digest of specified tag */
    const { digest } = version.images.find(i => i.architecture === 'amd64')
    /* Return all tags/name with specified digest */
    const versions = flat
      .filter(r => r.images.some(i => i.digest === digest))
      .map(result => result.name)
    /* Determine most explicit SemVer of the result set */
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
