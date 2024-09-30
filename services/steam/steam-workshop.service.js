import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { renderSizeBadge, unitsQueryParam, unitsOpenApiParam } from '../size.js'
import { metric, formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
import { NotFound, pathParam, pathParams } from '../index.js'
import BaseSteamAPI from './steam-base.js'

const description = `
Using a web browser, you can find the ID in the url here:
<img
  src="https://user-images.githubusercontent.com/6497721/46358801-1bcb3200-c668-11e8-9963-931397853945.PNG"
  alt="The ID is the number found right after ?id= in the URI" />
In the steam client you can simply just Right-Click and 'Copy Page URL' and follow the above step
<img
  src="https://user-images.githubusercontent.com/7288322/46567027-27c83400-c987-11e8-9850-ab67d987202f.png"
  alt="Right-Click and 'Copy Page URL'" />
`

const steamCollectionSchema = Joi.object({
  response: Joi.object()
    .keys({
      collectiondetails: Joi.array()
        .items(
          Joi.object({
            children: Joi.array().required(),
          }).required(),
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
            result: Joi.number().integer().min(9).max(9).required(),
          }).required(),
        )
        .required(),
    })
    .required(),
}).required()

const collectionFoundOrNotSchema = Joi.alternatives(
  steamCollectionSchema,
  steamCollectionNotFoundSchema,
)

const steamFileSchema = Joi.object({
  response: Joi.object()
    .keys({
      publishedfiledetails: Joi.array()
        .items(
          Joi.object({
            file_size: Joi.number().integer().required(),
            time_created: Joi.number().integer().required(),
            time_updated: Joi.number().integer().required(),
            subscriptions: Joi.number().integer().required(),
            favorited: Joi.number().integer().required(),
            lifetime_subscriptions: Joi.number().integer().required(),
            lifetime_favorited: Joi.number().integer().required(),
            views: Joi.number().integer().required(),
          }),
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
            result: Joi.number().integer().min(9).max(9).required(),
          }).required(),
        )
        .min(1)
        .max(1)
        .required(),
    })
    .required(),
}).required()

const fileFoundOrNotSchema = Joi.alternatives(
  steamFileSchema,
  steamFileNotFoundSchema,
)

class SteamCollectionSize extends BaseSteamAPI {
  static category = 'other'

  static route = {
    base: 'steam/collection-files',
    pattern: ':collectionId',
  }

  static openApi = {
    '/steam/collection-files/{collectionId}': {
      get: {
        summary: 'Steam Collection Files',
        description,
        parameters: pathParams({
          name: 'collectionId',
          example: '180077636',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'files',
  }

  static render({ size }) {
    return { message: metric(size), color: 'brightgreen' }
  }

  static interf = 'ISteamRemoteStorage'

  static method = 'GetCollectionDetails'

  static version = '1'

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
}

class SteamFileService extends BaseSteamAPI {
  static interf = 'ISteamRemoteStorage'

  static method = 'GetPublishedFileDetails'

  static version = '1'

  async onRequest(obj) {
    throw new Error(`onRequest() wasn't implemented for ${this.name}`)
  }

  async handle(pathParams, queryParams) {
    const options = {
      method: 'POST',
      form: {
        itemcount: 1,
        'publishedfileids[0]': pathParams.fileId,
      },
    }

    const json = await this.fetch({ schema: fileFoundOrNotSchema, options })

    if (json.response.publishedfiledetails[0].result) {
      throw new NotFound({ prettyMessage: 'file not found' })
    }

    return this.onRequest({
      response: json.response.publishedfiledetails[0],
      pathParams,
      queryParams,
    })
  }
}

const defaultUnits = 'metric'
const fileSizeQueryParamSchema = Joi.object({
  units: unitsQueryParam.default(defaultUnits),
}).required()

class SteamFileSize extends SteamFileService {
  static category = 'size'

  static route = {
    base: 'steam/size',
    pattern: ':fileId',
    queryParamSchema: fileSizeQueryParamSchema,
  }

  static openApi = {
    '/steam/size/{fileId}': {
      get: {
        summary: 'Steam File Size',
        description,
        parameters: [
          pathParam({
            name: 'fileId',
            example: '100',
          }),
          unitsOpenApiParam(defaultUnits),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'size',
  }

  async onRequest({ response, queryParams }) {
    return renderSizeBadge(response.file_size, queryParams.units)
  }
}

class SteamFileReleaseDate extends SteamFileService {
  static category = 'activity'

  static route = {
    base: 'steam/release-date',
    pattern: ':fileId',
  }

  static openApi = {
    '/steam/release-date/{fileId}': {
      get: {
        summary: 'Steam Release Date',
        description,
        parameters: pathParams({
          name: 'fileId',
          example: '100',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'release date',
  }

  static render({ releaseDate }) {
    return { message: formatDate(releaseDate), color: ageColor(releaseDate) }
  }

  async onRequest({ response }) {
    const releaseDate = new Date(0).setUTCSeconds(response.time_created)
    return this.constructor.render({ releaseDate })
  }
}

class SteamFileUpdateDate extends SteamFileService {
  static category = 'activity'

  static route = {
    base: 'steam/update-date',
    pattern: ':fileId',
  }

  static openApi = {
    '/steam/update-date/{fileId}': {
      get: {
        summary: 'Steam Update Date',
        description,
        parameters: pathParams({
          name: 'fileId',
          example: '100',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'update date',
  }

  static render({ updateDate }) {
    return { message: formatDate(updateDate), color: ageColor(updateDate) }
  }

  async onRequest({ response }) {
    const updateDate = new Date(0).setUTCSeconds(response.time_updated)
    return this.constructor.render({ updateDate })
  }
}

class SteamFileSubscriptions extends SteamFileService {
  static category = 'rating'

  static route = {
    base: 'steam/subscriptions',
    pattern: ':fileId',
  }

  static openApi = {
    '/steam/subscriptions/{fileId}': {
      get: {
        summary: 'Steam Subscriptions',
        description,
        parameters: pathParams({
          name: 'fileId',
          example: '100',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'subscriptions',
  }

  static render({ subscriptions }) {
    return { message: metric(subscriptions), color: 'brightgreen' }
  }

  async onRequest({ response }) {
    return this.constructor.render({ subscriptions: response.subscriptions })
  }
}

class SteamFileFavorites extends SteamFileService {
  static category = 'rating'

  static route = {
    base: 'steam/favorites',
    pattern: ':fileId',
  }

  static openApi = {
    '/steam/favorites/{fileId}': {
      get: {
        summary: 'Steam Favorites',
        description,
        parameters: pathParams({
          name: 'fileId',
          example: '100',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'favorites',
  }

  static render({ favorites }) {
    return { message: metric(favorites), color: 'brightgreen' }
  }

  async onRequest({ response }) {
    return this.constructor.render({ favorites: response.favorited })
  }
}

class SteamFileDownloads extends SteamFileService {
  static category = 'downloads'

  static route = {
    base: 'steam/downloads',
    pattern: ':fileId',
  }

  static openApi = {
    '/steam/downloads/{fileId}': {
      get: {
        summary: 'Steam Downloads',
        description,
        parameters: pathParams({
          name: 'fileId',
          example: '100',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async onRequest({ response: { lifetime_subscriptions: downloads } }) {
    return renderDownloadsBadge({ downloads })
  }
}

class SteamFileViews extends SteamFileService {
  static category = 'other'

  static route = {
    base: 'steam/views',
    pattern: ':fileId',
  }

  static openApi = {
    '/steam/views/{fileId}': {
      get: {
        summary: 'Steam Views',
        description,
        parameters: pathParams({
          name: 'fileId',
          example: '100',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'views',
  }

  static render({ views }) {
    return { message: metric(views), color: 'brightgreen' }
  }

  async onRequest({ response }) {
    return this.constructor.render({ views: response.views })
  }
}

export {
  SteamCollectionSize,
  SteamFileSize,
  SteamFileReleaseDate,
  SteamFileUpdateDate,
  SteamFileSubscriptions,
  SteamFileFavorites,
  SteamFileDownloads,
  SteamFileViews,
}
