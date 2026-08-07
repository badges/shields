import Joi from 'joi'
import { renderDateBadge } from '../date.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, NotFound, pathParams } from '../index.js'
import { buildDockerUrl, getDockerHubUser } from './docker-helpers.js'
import { fetch } from './docker-hub-common-fetch.js'

const tagSchema = Joi.object({
  last_updated: Joi.string().required(),
}).required()

const newestSchema = Joi.object({
  count: nonNegativeInteger.required(),
  results: Joi.array()
    .items(
      Joi.object({
        last_updated: Joi.string().required(),
      }),
    )
    .required(),
}).required()

export default class DockerLastUpdated extends BaseJsonService {
  static category = 'activity'
  static route = buildDockerUrl('last-updated', true)

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
    '/docker/last-updated/{user}/{repo}': {
      get: {
        summary: 'Docker Image Last Updated',
        description:
          'Shows when the most recently updated tag of a Docker Hub image was last pushed.',
        parameters: pathParams(
          { name: 'user', example: '_' },
          { name: 'repo', example: 'alpine' },
        ),
      },
    },
    '/docker/last-updated/{user}/{repo}/{tag}': {
      get: {
        summary: 'Docker Image Last Updated (tag)',
        description:
          'Shows when a specific Docker Hub image tag was last pushed.',
        parameters: pathParams(
          { name: 'user', example: '_' },
          { name: 'repo', example: 'alpine' },
          { name: 'tag', example: 'latest' },
        ),
      },
    },
  }

  static _cacheLength = 900

  static defaultBadgeData = { label: 'last updated' }

  static render({ date }) {
    return renderDateBadge(date)
  }

  async fetch({ user, repo, tag }) {
    return await fetch(this, {
      schema: tag ? tagSchema : newestSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user,
      )}/${repo}/tags${tag ? `/${tag}` : '?page_size=1&ordering=last_updated'}`,
      httpErrors: { 404: 'repository or tag not found' },
    })
  }

  transform({ tag, data }) {
    if (tag) {
      return { date: data.last_updated }
    }
    if (data.count === 0 || data.results.length === 0) {
      throw new NotFound({ prettyMessage: 'repository not found' })
    }
    return { date: data.results[0].last_updated }
  }

  async handle({ user, repo, tag }) {
    const data = await this.fetch({ user, repo, tag })
    const { date } = this.transform({ tag, data })
    return this.constructor.render({ date })
  }
}
