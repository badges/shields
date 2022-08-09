import Joi from 'joi'
import prettyBytes from 'pretty-bytes'
import { nonNegativeInteger } from '../validators.js'
import { latest } from '../version.js'
import { BaseJsonService, NotFound } from '../index.js'
import {
  buildDockerUrl,
  getDockerHubUser,
  getMultiPageData,
  validDockerArchitectures,
} from './docker-helpers.js'

const buildSchema = Joi.object({
  name: Joi.string().required(),
  full_size: nonNegativeInteger.required(),
  images: Joi.array().items(
    Joi.object({
      size: nonNegativeInteger.required(),
    })
  ),
}).required()

const pagedSchema = Joi.object({
  count: nonNegativeInteger.required(),
  results: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      full_size: nonNegativeInteger.required(),
      images: Joi.any().required(),
    })
  ),
}).required()

const queryParamSchema = Joi.object({
  sort: Joi.string().valid('date', 'semver').default('date'),
  arch: Joi.string().valid(...validDockerArchitectures),
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
      title:
        'Docker Image Size with architecture (latest by date/latest semver)',
      pattern: ':user/:repo',
      namedParams: { user: 'library', repo: 'mysql' },
      queryParams: { sort: 'date', arch: 'amd64' },
      staticPreview: this.render({ size: 146000000 }),
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

  noTagWithDateSortTransform(data, arch) {
    let sizeFromSpecifiedArchitecture

    if (data.count === 0) {
      throw new NotFound({ prettyMessage: 'repository not found' })
    } else {
      const latestEntry = data.results[0]

      // If no tag is specified, and sorting is by date, check if any of the returned images has an architecture matching the arch parameter supplied by the user.
      // If yes, return the size of the image with this arch.
      // If not, return the value of the `full_size` in the latestEntry from the response.
      // For details see: https://github.com/badges/shields/issues/8238

      Object.values(latestEntry.images).forEach(img => {
        if (img.architecture === arch) {
          sizeFromSpecifiedArchitecture = img.size
        }
      })

      return {
        size: sizeFromSpecifiedArchitecture || latestEntry.full_size,
      }
    }
  }

  noTagWithSemverSortTransform(data, arch) {
    // If no tag is specified, and sorting is by semver, first filter out the entry containing the latest semver from the response with Docker images.
    // Then check if any of the returned images for this entry has an architecture matching the arch parameter supplied by the user.
    // If yes, return the size of the image with this arch.
    // If not, return the value of the `full_size` from the entry matching the latest semver.

    let sizeFromSpecifiedArchitecture

    const [matches, versions, images] = data.reduce(
      ([m, v, i], d) => {
        m[d.name] = d.full_size
        v.push(d.name)
        i[d.name] = d.images
        return [m, v, i]
      },
      [{}, [], {}]
    )

    const version = latest(versions)

    Object.keys(images).forEach(ver => {
      if (ver === version) {
        Object.values(images[ver]).forEach(img => {
          if (img.architecture === arch) {
            sizeFromSpecifiedArchitecture = img.size
          }
        })
      }
    })

    return { size: sizeFromSpecifiedArchitecture || matches[version] }
  }

  yesTagTransform(data, arch) {
    // If the tag is specified, check if any of the returned images has an architecture matching the arch parameter supplied by the user.
    // If yes, return the size of the image with this arch.
    // If not, return the value of the `full_size` from the response (the image with the `latest` tag).

    let sizeFromSpecifiedArchitecture

    Object.values(data.images).forEach(img => {
      if (img.architecture === arch) {
        sizeFromSpecifiedArchitecture = img.size
      }
    })

    return {
      size: sizeFromSpecifiedArchitecture || data.full_size,
    }
  }

  transform({ tag, sort, data, arch }) {
    if (!tag && sort === 'date') {
      return this.noTagWithDateSortTransform(data, arch)
    } else if (!tag && sort === 'semver') {
      return this.noTagWithSemverSortTransform(data, arch)
    } else {
      return this.yesTagTransform(data, arch)
    }
  }

  async handle({ user, repo, tag }, { sort, arch }) {
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

    const { size } = await this.transform({ tag, sort, data, arch })
    return this.constructor.render({ size })
  }
}
