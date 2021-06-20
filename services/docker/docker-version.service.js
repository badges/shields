import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { latest, renderVersionBadge } from '../version.js'
import { BaseJsonService, NotFound, InvalidResponse } from '../index.js'
import {
  buildDockerUrl,
  getDockerHubUser,
  getMultiPageData,
  getDigestSemVerMatches,
} from './docker-helpers.js'

const buildSchema = Joi.object({
  count: nonNegativeInteger.required(),
  results: Joi.array().items(
    Joi.object({
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
  sort: Joi.string().valid('date', 'semver').default('date'),
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

export default class DockerVersion extends BaseJsonService {
  static category = 'version'
  static route = { ...buildDockerUrl('v', true), queryParamSchema }
  static examples = [
    {
      title: 'Docker Image Version (latest by date)',
      pattern: ':user/:repo',
      namedParams: { user: '_', repo: 'alpine' },
      queryParams: { sort: 'date', arch: 'amd64' },
      staticPreview: this.render({ version: '3.9.5' }),
    },
    {
      title: 'Docker Image Version (latest semver)',
      pattern: ':user/:repo',
      namedParams: { user: '_', repo: 'alpine' },
      queryParams: { sort: 'semver' },
      staticPreview: this.render({ version: '3.11.3' }),
    },
    {
      title: 'Docker Image Version (tag latest semver)',
      pattern: ':user/:repo/:tag',
      namedParams: { user: '_', repo: 'alpine', tag: '3.6' },
      staticPreview: this.render({ version: '3.6.5' }),
    },
  ]

  static defaultBadgeData = { label: 'version', color: 'blue' }

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
      errorMessages: { 404: 'repository or tag not found' },
    })
  }

  transform({ tag, sort, data, pagedData, arch = 'amd64' }) {
    let version

    if (!tag && sort === 'date') {
      version = data.results[0].name
      if (version !== 'latest') {
        return { version }
      }
      const imageTag = data.results[0].images.find(i => i.architecture === arch) // Digest is the unique field that we utilise to match images
      if (!imageTag) {
        throw new InvalidResponse({
          prettyMessage: 'digest not found for latest tag',
        })
      }
      const { digest } = imageTag
      return { version: getDigestSemVerMatches({ data: pagedData, digest }) }
    } else if (!tag && sort === 'semver') {
      const matches = data.map(d => d.name)
      return { version: latest(matches) }
    } else {
      version = data.find(d => d.name === tag)
      if (!version) {
        throw new NotFound({ prettyMessage: 'tag not found' })
      }
      if (Object.keys(version.images).length === 0) {
        return { version: version.name }
      }
      const image = version.images.find(i => i.architecture === arch)
      if (!image) {
        throw new InvalidResponse({
          prettyMessage: 'digest not found for given tag',
        })
      }
      const { digest } = image
      return { version: getDigestSemVerMatches({ data, digest }) }
    }
  }

  async handle({ user, repo, tag }, { sort, arch }) {
    let data, pagedData

    if (!tag && sort === 'date') {
      data = await this.fetch({ user, repo })
      if (data.count === 0) {
        throw new NotFound({ prettyMessage: 'repository not found' })
      }
      if (data.results[0].name === 'latest') {
        pagedData = await getMultiPageData({
          user,
          repo,
          fetch: this.fetch.bind(this),
        })
      }
    } else {
      data = await getMultiPageData({
        user,
        repo,
        fetch: this.fetch.bind(this),
      })
    }

    const { version } = await this.transform({
      tag,
      sort,
      data,
      pagedData,
      arch,
    })
    return this.constructor.render({ version })
  }
}
