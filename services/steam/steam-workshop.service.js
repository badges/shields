'use strict'

const Joi = require('joi')
const BaseSteamAPI = require('./steam-base')
const { NotFound } = require('../errors')
const { metric, formatDate } = require('../../lib/text-formatters')
const { age: ageColor, downloadCount } = require('../../lib/color-formatters')
const prettyBytes = require('pretty-bytes')

const docs = `
<p>
  Using a web browser, you can find the ID in the url here:
</p>
<img
  src="https://user-images.githubusercontent.com/6497721/46358801-1bcb3200-c668-11e8-9963-931397853945.PNG"
  alt="The ID is the number found right after ?id= in the URI" />
<p>
  In the steam client you can simply just Right-Click and 'Copy Page URL' and follow the above step
</p>
<img
  src="https://user-images.githubusercontent.com/7288322/46567027-27c83400-c987-11e8-9850-ab67d987202f.png"
  alt="Right-Click and 'Copy Page URL'">
`

const steamCollectionSchema = Joi.object({
  response: Joi.object()
    .keys({
      collectiondetails: Joi.array()
        .items(
          Joi.object({
            children: Joi.array().required(),
          }).required()
        )
        .required(),
    })
    .required(),
}).required()

const steamCollectionNotFoundSchema = Joi.object({
  response: Joi.object()
    .keys({
      collectiondetails: Joi.array()
        .items(
          Joi.object({
            result: Joi.number()
              .integer()
              .min(9)
              .max(9)
              .required(),
          }).required()
        )
        .required(),
    })
    .required(),
}).required()

const collectionFoundOrNotSchema = Joi.alternatives(
  steamCollectionSchema,
  steamCollectionNotFoundSchema
)

const steamFileSchema = Joi.object({
  response: Joi.object()
    .keys({
      publishedfiledetails: Joi.array()
        .items(
          Joi.object({
            file_size: Joi.number()
              .integer()
              .required(),
            time_created: Joi.number()
              .integer()
              .required(),
            subscriptions: Joi.number()
              .integer()
              .required(),
            favorited: Joi.number()
              .integer()
              .required(),
            lifetime_subscriptions: Joi.number()
              .integer()
              .required(),
            lifetime_favorited: Joi.number()
              .integer()
              .required(),
            views: Joi.number()
              .integer()
              .required(),
          })
        )
        .min(1)
        .max(1)
        .required(),
    })
    .required(),
}).required()

const steamFileNotFoundSchema = Joi.object({
  response: Joi.object()
    .keys({
      publishedfiledetails: Joi.array()
        .items(
          Joi.object({
            result: Joi.number()
              .integer()
              .min(9)
              .max(9)
              .required(),
          }).required()
        )
        .min(1)
        .max(1)
        .required(),
    })
    .required(),
}).required()

const fileFoundOrNotSchema = Joi.alternatives(
  steamFileSchema,
  steamFileNotFoundSchema
)

class SteamCollectionSize extends BaseSteamAPI {
  static get interf() {
    return 'ISteamRemoteStorage'
  }

  static get method() {
    return 'GetCollectionDetails'
  }

  static get version() {
    return '1'
  }

  static render({ size }) {
    return { message: metric(size), color: 'brightgreen' }
  }

  async handle({ collectionId }) {
    const options = {
      method: 'POST',
      form: {
        collectioncount: '1',
        'publishedfileids[0]': collectionId,
      },
    }

    const json = await this.fetch({
      schema: collectionFoundOrNotSchema,
      options,
    })

    if (json.response.collectiondetails[0].result) {
      throw new NotFound({ prettyMessage: 'collection not found' })
    }

    return this.constructor.render({
      size: json.response.collectiondetails[0].children.length,
    })
  }

  static get category() {
    return 'other'
  }

  static get defaultBadgeData() {
    return { label: 'files' }
  }

  static get route() {
    return {
      base: 'steam/collection-files',
      pattern: ':collectionId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam Collection Files',
        exampleUrl: '180077636',
        pattern: ':id',
        staticExample: this.render({ size: 32 }),
        keywords: ['steam'],
        documentation: docs,
      },
    ]
  }
}

class SteamFileService extends BaseSteamAPI {
  static get interf() {
    return 'ISteamRemoteStorage'
  }

  static get method() {
    return 'GetPublishedFileDetails'
  }

  static get version() {
    return '1'
  }

  async handle({ fileId }) {
    const options = {
      method: 'POST',
      form: {
        itemcount: 1,
        'publishedfileids[0]': fileId,
      },
    }

    const json = await this.fetch({ schema: fileFoundOrNotSchema, options })

    if (json.response.publishedfiledetails[0].result) {
      throw new NotFound({ prettyMessage: 'file not found' })
    }

    return this.onRequest({ response: json.response.publishedfiledetails[0] })
  }

  async onRequest({ response }) {
    throw new Error(`onRequest() wasn't implemented for ${this.name}`)
  }

  static get defaultBadgeData() {
    return { label: 'steam' }
  }

  static get category() {
    return 'other'
  }
}

class SteamFileSize extends SteamFileService {
  static render({ fileSize }) {
    return { message: prettyBytes(fileSize), color: 'brightgreen' }
  }

  async onRequest({ response }) {
    return this.constructor.render({ fileSize: response.file_size })
  }

  static get category() {
    return 'size'
  }

  static get defaultBadgeData() {
    return { label: 'size' }
  }

  static get route() {
    return {
      base: 'steam/size',
      pattern: ':fileId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam File Size',
        exampleUrl: '100',
        pattern: ':id',
        staticExample: this.render({ fileSize: 20000 }),
        keywords: ['steam'],
        documentation: docs,
      },
    ]
  }
}

class SteamFileReleaseDate extends SteamFileService {
  static render({ releaseDate }) {
    return { message: formatDate(releaseDate), color: ageColor(releaseDate) }
  }

  async onRequest({ response }) {
    const releaseDate = new Date(0).setUTCSeconds(response.time_created)
    return this.constructor.render({ releaseDate })
  }

  static get defaultBadgeData() {
    return { label: 'release date' }
  }

  static get route() {
    return {
      base: 'steam/release-date',
      pattern: ':fileId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam Release Date',
        exampleUrl: '100',
        pattern: ':id',
        staticExample: this.render({
          releaseDate: new Date(0).setUTCSeconds(1538288239),
        }),
        keywords: ['steam'],
        documentation: docs,
      },
    ]
  }
}

class SteamFileSubscriptions extends SteamFileService {
  static render({ subscriptions }) {
    return { message: metric(subscriptions), color: 'brightgreen' }
  }

  async onRequest({ response }) {
    return this.constructor.render({ subscriptions: response.subscriptions })
  }

  static get defaultBadgeData() {
    return { label: 'subscriptions' }
  }

  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'steam/subscriptions',
      pattern: ':fileId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam Subscriptions',
        exampleUrl: '100',
        pattern: ':id',
        staticExample: this.render({ subscriptions: 20124 }),
        keywords: ['steam'],
        documentation: docs,
      },
    ]
  }
}

class SteamFileFavorites extends SteamFileService {
  static render({ favorites }) {
    return { message: metric(favorites), color: 'brightgreen' }
  }

  async onRequest({ response }) {
    return this.constructor.render({ favorites: response.favorited })
  }

  static get defaultBadgeData() {
    return { label: 'favorites' }
  }

  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'steam/favorites',
      pattern: ':fileId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam Favorites',
        exampleUrl: '100',
        pattern: ':id',
        staticExample: this.render({ favorites: 20000 }),
        keywords: ['steam'],
        documentation: docs,
      },
    ]
  }
}

class SteamFileDownloads extends SteamFileService {
  static render({ downloads }) {
    return { message: metric(downloads), color: downloadCount(downloads) }
  }

  async onRequest({ response }) {
    return this.constructor.render({
      downloads: response.lifetime_subscriptions,
    })
  }

  static get category() {
    return 'downloads'
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static get route() {
    return {
      base: 'steam/downloads',
      pattern: ':fileId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam Downloads',
        exampleUrl: '100',
        pattern: ':id',
        staticExample: this.render({ downloads: 20124 }),
        keywords: ['steam'],
        documentation: docs,
      },
    ]
  }
}

class SteamFileViews extends SteamFileService {
  static render({ views }) {
    return { message: metric(views), color: 'brightgreen' }
  }

  async onRequest({ response }) {
    return this.constructor.render({ views: response.views })
  }

  static get defaultBadgeData() {
    return { label: 'views' }
  }

  static get route() {
    return {
      base: 'steam/views',
      pattern: ':fileId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam Views',
        exampleUrl: '100',
        pattern: ':id',
        staticExample: this.render({ views: 20000 }),
        keywords: ['steam'],
        documentation: docs,
      },
    ]
  }
}

module.exports = {
  SteamCollectionSize,
  SteamFileSize,
  SteamFileReleaseDate,
  SteamFileSubscriptions,
  SteamFileFavorites,
  SteamFileDownloads,
  SteamFileViews,
}
