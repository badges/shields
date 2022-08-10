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
      architecture: Joi.string().required(),
    })
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
        })
      ),
    })
  ),
}).required()

const queryParamSchema = Joi.object({
  sort: Joi.string().valid('date', 'semver').default('date'),
  arch: Joi.alternatives([
    Joi.string().valid(...validDockerArchitectures),
    Joi.number().valid(...validDockerArchitectures),
  ]),
}).required()

// If user provided the arch parameter,
// check if any of the returned images has an architecture matching the arch parameter provided.
// If yes, return the size of the image with this arch.
// If not, return the value of the `full_size` in the latestEntry from the response.
// For details see: https://github.com/badges/shields/issues/8238
function getImageForArch(images, arch) {
  // console.log('images', images)
  // let imageWithArchFound = false
  // let sizeToReturn

  // return Object.values(images).forEach(img => {
  //   console.log('arch', arch)
  //   console.log('img.architecture', img.architecture)
  //   console.log('img.architecture=== arch', img.architecture === arch)

  //   if (img.architecture === arch) {
  //     console.log('size', img.size)
  //     imageWithArchFound = true
  //     return img.size
  //   }
  // })

  const found = Object.values(images).find(img => img.architecture === arch)

  if (!found) {
    throw new NotFound({ prettyMessage: 'architecture not found' })
  }
  return found.size
  // console.log(found)

  // Object.values(images).find(img => {
  //   // console.log('arch', arch)
  //   // console.log('img.architecture', img.architecture)
  //   console.log('img.architecture=== arch', img.architecture === arch)

  //   if (img.architecture === arch) {
  //     console.log('size', img.size)
  //     imageWithArchFound = true
  //     sizeToReturn = img.size
  //     return true
  //   }

  //   return false
  //   // sizeToReturn = imageWithArchFound ? img.size : 0
  //   // console.log('####sizeToReturn', sizeToReturn)
  //   // return sizeToReturn
  // })

  // if (!imageWithArchFound) {
  //   throw new NotFound({ prettyMessage: 'architecture not found' })
  // }

  // console.log('sizeToReturn', sizeToReturn)
  // return sizeToReturn

  // throw new NotFound({ prettyMessage: 'architecture not found' })

  // if (!imageWithArchFound) {
  //   throw new NotFound({ prettyMessage: 'architecture not found' })
  // }

  // return 0
}

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
    // console.log('@@@@@@@@@@@@render, size: ', size)
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
    if (data.count === 0) {
      throw new NotFound({ prettyMessage: 'repository not found' })
    } else {
      const latestEntry = data.results[0]

      // console.log(latestEntry)

      if (arch) {
        return { size: getImageForArch(latestEntry.images, arch) }
      } else {
        return { size: latestEntry.full_size }
      }
    }
  }

  noTagWithSemverSortTransform(data, arch) {
    // If no tag is specified, and sorting is by semver, first filter out the entry containing the latest semver from the response with Docker images.
    // Then check if any of the returned images for this entry has an architecture matching the arch parameter supplied by the user.
    // If yes, return the size of the image with this arch.
    // If not, return the value of the `full_size` from the entry matching the latest semver.

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

    let noChyba

    if (arch) {
      Object.keys(images).forEach(ver => {
        if (ver === version) {
          console.log(
            '11111111111111111getImageForArch(images[ver], arch)',
            getImageForArch(images[ver], arch)
          )
          noChyba = getImageForArch(images[ver], arch)
          return { size: noChyba }
        }
      })
      return { size: noChyba }
    } else {
      return { size: matches[version] }
    }
  }

  yesTagTransform(data, arch) {
    // If the tag is specified, check if any of the returned images has an architecture matching the arch parameter supplied by the user.
    // If yes, return the size of the image with this arch.
    // If not, return the value of the `full_size` from the response (the image with the `latest` tag).
    // console.log('yesTagTransform data', data)
    if (arch) {
      return { size: getImageForArch(data.images, arch) }
    } else {
      return { size: data.full_size }
    }
  }

  transform({ tag, sort, data, arch }) {
    console.log('????????')

    console.log('tag', tag)
    console.log('sort', sort)
    // console.log('data', data)
    console.log('arch', arch)
    console.log('!!!!!!!!!!!!!!!!!!!!!!!')

    if (!tag && sort === 'date') {
      return this.noTagWithDateSortTransform(data, arch)
    } else if (!tag && sort === 'semver') {
      console.log(
        'aloha **************',
        this.noTagWithSemverSortTransform(data, arch)
      )

      return this.noTagWithSemverSortTransform(data, arch)
    } else {
      // console.log('aloha **************', this.yesTagTransform(data, arch))
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

    console.log(
      '(((((((((((((((((((((9await this.transform({ tag, sort, data, arch }',
      await this.transform({ tag, sort, data, arch })
    )

    const { size } = await this.transform({ tag, sort, data, arch })
    // console.log('SIZE, , size $$$$$$$$$$$$$$$$$$$$$$$$$$$$$:', size)
    return this.constructor.render({ size })
  }
}
