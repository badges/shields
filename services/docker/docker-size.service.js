import Joi from 'joi'
import prettyBytes from 'pretty-bytes'
import { nonNegativeInteger } from '../validators.js'
import { latest } from '../version.js'
import { BaseJsonService, NotFound } from '../index.js'
import {
  buildDockerUrl,
  getDockerHubUser,
  getMultiPageData,
} from './docker-helpers.js'

const buildSchema = Joi.object({
  name: Joi.string().required(),
  full_size: nonNegativeInteger.required(),
}).required()

const pagedSchema = Joi.object({
  count: nonNegativeInteger.required(),
  results: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      full_size: nonNegativeInteger.required(),
    })
  ),
}).required()

const queryParamSchema = Joi.object({
  sort: Joi.string().valid('date', 'semver').default('date'),
}).required()

export default class DockerSize extends BaseJsonService {
  static category = 'size'
  static route = { ...buildDockerUrl('image-size', true), queryParamSchema }
  static examples = [
    {
      title: 'Docker Image Size (latest by date)',
      pattern: ':user/:repo',
      namedParams: { user: 'fedora', repo: 'apache' },
      queryParams: { sort: 'date' },
      staticPreview: this.render({ size: 126000000 }),
    },
    {
      title: 'Docker Image Size (latest semver)',
      pattern: ':user/:repo',
      namedParams: { user: 'fedora', repo: 'apache' },
      queryParams: { sort: 'semver' },
      staticPreview: this.render({ size: 136000000 }),
    },
    {
      title: 'Docker Image Size (tag)',
      pattern: ':user/:repo/:tag',
      namedParams: { user: 'fedora', repo: 'apache', tag: 'latest' },
      staticPreview: this.render({ size: 103000000 }),
    },
  ]

  static defaultBadgeData = { label: 'image size', color: 'blue' }

  static render({ size }) {
    return { message: prettyBytes(size) }
  }

  async fetch({ user, repo, tag, page }) {
    page = page ? `&page=${page}` : ''
    return this._requestJson({
      schema: tag ? buildSchema : pagedSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user
      )}/${repo}/tags${
        tag ? `/${tag}` : '?page_size=100&ordering=last_updated'
      }${page}`,
      errorMessages: { 404: 'repository or tag not found' },
    })
  }

  transform({ tag, sort, data }) {
    if (!tag && sort === 'date') {
      if (data.count === 0) {
        throw new NotFound({ prettyMessage: 'repository not found' })
      } else {
        return { size: data.results[0].full_size }
      }
    } else if (!tag && sort === 'semver') {
      const [matches, versions] = data.reduce(
        ([m, v], d) => {
          m[d.name] = d.full_size
          v.push(d.name)
          return [m, v]
        },
        [{}, []]
      )
      const version = latest(versions)
      return { size: matches[version] }
    } else {
      return { size: data.full_size }
    }
  }

  async handle({ user, repo, tag }, { sort }) {
    let data

    if (!tag && sort === 'date') {
      data = await this.fetch({ user, repo })
    } else if (!tag && sort === 'semver') {
      data = await getMultiPageData({
        user,
        repo,
        fetch: this.fetch.bind(this),
      })
    } else {
      data = await this.fetch({ user, repo, tag })
    }

    const { size } = await this.transform({ tag, sort, data })
    return this.constructor.render({ size })
  }
}
