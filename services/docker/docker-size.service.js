import Joi from 'joi'
import { renderSizeBadge } from '../size.js'
import { nonNegativeInteger } from '../validators.js'
import { latest } from '../version.js'
import { BaseJsonService, NotFound, pathParams, queryParams } from '../index.js'
import {
  archEnum,
  archSchema,
  buildDockerUrl,
  getDockerHubUser,
  getMultiPageData,
} from './docker-helpers.js'
import { fetch } from './docker-hub-common-fetch.js'

const buildSchema = Joi.object({
  name: Joi.string().required(),
  full_size: nonNegativeInteger.required(),
  images: Joi.array().items(
    Joi.object({
      size: nonNegativeInteger.required(),
      architecture: Joi.string().required(),
    }),
  ),
}).required()

const pagedSchema = Joi.object({
  count: nonNegativeInteger.required(),
  results: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      full_size: nonNegativeInteger.required(),
      images: Joi.array().items(
        Joi.object({
          size: nonNegativeInteger.required(),
          architecture: Joi.string().required(),
        }),
      ),
    }),
  ),
}).required()

const sortEnum = ['date', 'semver']

const queryParamSchema = Joi.object({
  sort: Joi.string()
    .valid(...sortEnum)
    .default('date'),
  arch: archSchema,
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
  },
)

// If user provided the arch parameter,
// check if any of the returned images has an architecture matching the arch parameter provided.
// If yes, return the size of the image with this arch.
// If not, throw the `NotFound` error.
// For details see: https://github.com/badges/shields/issues/8238
function getImageSizeForArch(images, arch) {
  const imgWithArch = Object.values(images).find(
    img => img.architecture === arch,
  )

  if (!imgWithArch) {
    throw new NotFound({ prettyMessage: 'architecture not found' })
  }
  return imgWithArch.size
}

export default class DockerSize extends BaseJsonService {
  static category = 'size'
  static route = { ...buildDockerUrl('image-size', true), queryParamSchema }

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
    '/docker/image-size/{user}/{repo}': {
      get: {
        summary: 'Docker Image Size',
        parameters: [
          ...pathParams(
            { name: 'user', example: 'fedora' },
            { name: 'repo', example: 'apache' },
          ),
          ...openApiQueryParams,
        ],
      },
    },
    '/docker/image-size/{user}/{repo}/{tag}': {
      get: {
        summary: 'Docker Image Size (tag)',
        parameters: [
          ...pathParams(
            { name: 'user', example: 'fedora' },
            { name: 'repo', example: 'apache' },
            { name: 'tag', example: 'latest' },
          ),
          ...openApiQueryParams,
        ],
      },
    },
  }

  static _cacheLength = 600

  static defaultBadgeData = { label: 'image size', color: 'blue' }

  async fetch({ user, repo, tag, page }) {
    page = page ? `&page=${page}` : ''
    return await fetch(this, {
      schema: tag ? buildSchema : pagedSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user,
      )}/${repo}/tags${
        tag ? `/${tag}` : '?page_size=100&ordering=last_updated'
      }${page}`,
      httpErrors: { 404: 'repository or tag not found' },
    })
  }

  getSizeFromImageByLatestDate(data, arch) {
    if (data.count === 0) {
      throw new NotFound({ prettyMessage: 'repository not found' })
    } else {
      const latestEntry = data.results[0]

      if (arch) {
        return { size: getImageSizeForArch(latestEntry.images, arch) }
      } else {
        return { size: latestEntry.full_size }
      }
    }
  }

  getSizeFromImageByLatestSemver(data, arch) {
    // If no tag is specified, and sorting is by semver, first filter out the entry containing the latest semver from the response with Docker images.
    // If no architecture is supplied by the user, return `full_size` from this entry.
    // If the architecture is supplied by the user, check if any of the returned images for this entry has an architecture matching the arch parameter supplied by the user.
    // If yes, return the size of the image with this arch.
    // If not, throw the `NotFound` error.

    const [matches, versions, images] = data.reduce(
      ([m, v, i], d) => {
        m[d.name] = d.full_size
        v.push(d.name)
        i[d.name] = d.images
        return [m, v, i]
      },
      [{}, [], {}],
    )

    const version = latest(versions)

    let sizeOfImgWithArch

    if (arch) {
      Object.keys(images).forEach(ver => {
        if (ver === version) {
          sizeOfImgWithArch = getImageSizeForArch(images[ver], arch)
          return { size: sizeOfImgWithArch }
        }
      })

      if (sizeOfImgWithArch) {
        return { size: sizeOfImgWithArch }
      } else {
        throw new NotFound({ prettyMessage: 'architecture not found' })
      }
    } else {
      return { size: matches[version] }
    }
  }

  getSizeFromTag(data, arch) {
    // If the tag is specified, and the architecture is supplied by the user,
    // check if any of the returned images has an architecture matching the arch parameter supplied by the user.
    // If yes, return the size of the image with this arch.
    // If no, throw the `NotFound` error.
    // If no architecture is supplied by the user, return the value of the `full_size` from the response (the image with the `latest` tag).
    if (arch) {
      return { size: getImageSizeForArch(data.images, arch) }
    } else {
      return { size: data.full_size }
    }
  }

  transform({ tag, sort, data, arch }) {
    if (!tag && sort === 'date') {
      return this.getSizeFromImageByLatestDate(data, arch)
    } else if (!tag && sort === 'semver') {
      return this.getSizeFromImageByLatestSemver(data, arch)
    } else {
      return this.getSizeFromTag(data, arch)
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
    return renderSizeBadge(size, 'iec', 'image size')
  }
}
