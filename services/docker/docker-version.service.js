import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { latest, renderVersionBadge } from '../version.js'
import {
  BaseJsonService,
  NotFound,
  InvalidResponse,
  pathParams,
  queryParams,
} from '../index.js'
import {
  archEnum,
  archSchema,
  buildDockerUrl,
  getDockerHubUser,
  getMultiPageData,
  getDigestSemVerMatches,
} from './docker-helpers.js'
import { fetch } from './docker-hub-common-fetch.js'

const buildSchema = Joi.object({
  count: nonNegativeInteger.required(),
  results: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      images: Joi.array().items(
        Joi.object({
          digest: Joi.string(),
          architecture: Joi.string().required(),
        }),
      ),
    }),
  ),
}).required()

const sortEnum = ['date', 'semver']

const queryParamSchema = Joi.object({
  sort: Joi.string().valid('date', 'semver').default('date'),
  arch: archSchema.default('amd64'),
}).required()

const openApiQueryParams = queryParams(
  {
    name: 'sort',
    example: 'semver',
    schema: { type: 'string', enum: sortEnum },
    description: 'If not specified, the default is `date`',
  },
  {
    name: 'arch',
    example: 'amd64',
    schema: { type: 'string', enum: archEnum },
    description: 'If not specified, the default is `amd64`',
  },
)

export default class DockerVersion extends BaseJsonService {
  static category = 'version'
  static route = { ...buildDockerUrl('v', true), queryParamSchema }

  static auth = {
    userKey: 'dockerhub_username',
    passKey: 'dockerhub_pat',
    authorizedOrigins: [
      'https://hub.docker.com',
      'https://registry.hub.docker.com',
    ],
    isRequired: false,
  }

  static openApi = {
    '/docker/v/{user}/{repo}': {
      get: {
        summary: 'Docker Image Version',
        parameters: [
          ...pathParams(
            { name: 'user', example: '_' },
            { name: 'repo', example: 'alpine' },
          ),
          ...openApiQueryParams,
        ],
      },
    },
    '/docker/v/{user}/{repo}/{tag}': {
      get: {
        summary: 'Docker Image Version (tag)',
        parameters: [
          ...pathParams(
            { name: 'user', example: '_' },
            { name: 'repo', example: 'alpine' },
            { name: 'tag', example: '3.6' },
          ),
          ...openApiQueryParams,
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'version', color: 'blue' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ user, repo, page }) {
    page = page ? `&page=${page}` : ''
    return await fetch(this, {
      schema: buildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user,
      )}/${repo}/tags?page_size=100&ordering=last_updated${page}`,
      httpErrors: { 404: 'repository or tag not found' },
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

    const { version } = this.transform({
      tag,
      sort,
      data,
      pagedData,
      arch,
    })
    return this.constructor.render({ version })
  }
}
