'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { metric, formatDate } = require('../../lib/text-formatters')
const { age: ageColor } = require('../../lib/color-formatters')
const prettyBytes = require('pretty-bytes')

const steamCollectionSchema = Joi.object({
  response: Joi.object()
    .keys({
      result: Joi.number()
        .integer()
        .min(1)
        .max(1)
        .required(),
      resultcount: Joi.number()
        .integer()
        .min(0)
        .max(1)
        .required(),
      collectiondetails: Joi.array()
        .items(
          Joi.object({
            publishedfileid: Joi.string(),
            result: Joi.number().integer(),
            children: Joi.array(),
          })
        )
        .required(),
    })
    .required(),
}).required()

const steamFileSchema = Joi.object({
  response: Joi.object()
    .keys({
      result: Joi.number()
        .integer()
        .min(1)
        .required(),
      resultcount: Joi.number()
        .integer()
        .min(0)
        .required(),
      publishedfiledetails: Joi.array().items(
        Joi.object({
          publishedfileid: Joi.string().required(),
          result: Joi.number()
            .integer()
            .required(),
          file_size: Joi.number().integer(),
          time_created: Joi.number().integer(),
          subscriptions: Joi.number().integer(),
          favorited: Joi.number().integer(),
          lifetime_subscriptions: Joi.number().integer(),
          lifetime_favorited: Joi.number().integer(),
          views: Joi.number().integer(),
        })
      ),
    })
    .required(),
}).required()

class SteamCollectionFiles extends BaseJsonService {
  async fetch({ collectionId }) {
    const url =
      'https://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/?format=json'
    return this._requestJson({
      url,
      schema: steamCollectionSchema,
      errorMessages: {
        400: 'bad request',
      },
      options: {
        method: 'POST',
        form: {
          collectioncount: '1',
          'publishedfileids[0]': collectionId,
        },
      },
    })
  }

  static render({ size }) {
    return { message: metric(size), color: 'green' }
  }

  async handle({ collectionId }) {
    const json = await this.fetch({ collectionId })
    if (json.response.collectiondetails[0].result === 1) {
      return this.constructor.render({
        size: json.response.collectiondetails[0].children.length,
      })
    } else {
      return { message: 'collection not found', color: 'red' }
    }
  }

  static get category() {
    return 'other'
  }

  static get defaultBadgeData() {
    return { label: 'files' }
  }

  static get url() {
    return {
      base: 'steam/collection-files',
      format: '(.+)',
      capture: ['collectionId'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam Collection Files',
        exampleUrl: '180077636',
        urlPattern: ':collection_id',
        staticExample: this.render({ size: 32 }),
        keywords: ['steam'],
      },
    ]
  }
}

class SteamFileService extends BaseJsonService {
  async fetch({ fileId }) {
    const url =
      'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/?format=json'
    return this._requestJson({
      url,
      schema: steamFileSchema,
      errorMessages: {
        400: 'bad request',
      },
      options: {
        method: 'POST',
        form: {
          itemcount: 1,
          'publishedfileids[0]': fileId,
        },
      },
    })
  }

  async handle({ fileId }) {
    const json = await this.fetch({ fileId })

    if (json.response.publishedfiledetails[0].result === 1) {
      return this.onRequest({ response: json.response.publishedfiledetails[0] })
    } else {
      return { message: 'file not found', color: 'red' }
    }
  }

  async onRequest({ response }) {}

  static get defaultBadgeData() {
    return { label: 'steam' }
  }

  static get category() {
    return 'other'
  }
}

class SteamFileSize extends SteamFileService {
  static render({ fileSize }) {
    return { message: prettyBytes(fileSize), color: 'green' }
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

  static get url() {
    return {
      base: 'steam/size',
      format: '(.+)',
      capture: ['fileId'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam File Size',
        exampleUrl: '100',
        urlPattern: ':file_id',
        staticExample: this.render({ fileSize: 20000 }),
        keywords: ['steam'],
      },
    ]
  }
}

class SteamReleaseDate extends SteamFileService {
  static render({ releaseDate }) {
    return { message: formatDate(releaseDate), color: ageColor(releaseDate) }
  }

  async onRequest({ response }) {
    const releaseDate = new Date(0).setUTCSeconds(response.time_created)
    return this.constructor.render({ releaseDate: releaseDate })
  }

  static get defaultBadgeData() {
    return { label: 'release date' }
  }

  static get url() {
    return {
      base: 'steam/release-date',
      format: '(.+)',
      capture: ['fileId'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam Release Date',
        exampleUrl: '100',
        urlPattern: ':file_id',
        staticExample: this.render({ releaseDate: new Date(0).setUTCSeconds(1538288239) }),
        keywords: ['steam'],
      },
    ]
  }
}

class SteamSubscriptions extends SteamFileService {
  static render({ subscriptions }) {
    return { message: metric(subscriptions), color: 'lime' }
  }

  async onRequest({ response }) {
    return this.constructor.render({ subscriptions: response.subscriptions })
  }

  static get defaultBadgeData() {
    return { label: 'subscriptions' }
  }

  static get url() {
    return {
      base: 'steam/subscriptions',
      format: '(.+)',
      capture: ['fileId'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam Subscriptions',
        exampleUrl: '100',
        urlPattern: ':file_id',
        staticExample: this.render({ subscriptions: 20124 }),
        keywords: ['steam'],
      },
    ]
  }
}

class SteamFavorites extends SteamFileService {
  static render({ favorites }) {
    return { message: metric(favorites), color: 'lime' }
  }

  async onRequest({ response }) {
    return this.constructor.render({ favorited: response.favorited })
  }

  static get defaultBadgeData() {
    return { label: 'favorites' }
  }

  static get url() {
    return {
      base: 'steam/favorites',
      format: '(.+)',
      capture: ['fileId'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam Favourites',
        exampleUrl: '100',
        urlPattern: ':file_id',
        staticExample: this.render({ favorites: 20124 }),
        keywords: ['steam'],
      },
    ]
  }
}

class SteamDownloads extends SteamFileService {
  static render({ downloads }) {
    return { message: metric(downloads), color: 'lime' }
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

  static get url() {
    return {
      base: 'steam/downloads',
      format: '(.+)',
      capture: ['fileId'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam Downloads',
        exampleUrl: '100',
        urlPattern: ':file_id',
        staticExample: this.render({ downloads: 20124 }),
        keywords: ['steam'],
      },
    ]
  }
}

class SteamViews extends SteamFileService {
  static render({ views }) {
    return { message: metric(views), color: 'lime' }
  }

  async onRequest({ response }) {
    return this.constructor.render({ views: response.views })
  }

  static get defaultBadgeData() {
    return { label: 'views' }
  }

  static get url() {
    return {
      base: 'steam/views',
      format: '(.+)',
      capture: ['fileId'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Steam Views',
        exampleUrl: '100',
        urlPattern: ':file_id',
        staticExample: this.render({ views: 20000 }),
        keywords: ['steam'],
      },
    ]
  }
}

module.exports = {
  SteamCollectionFiles,
  SteamFileSize,
  SteamReleaseDate,
  SteamSubscriptions,
  SteamFavorites,
  SteamDownloads,
  SteamViews,
}
