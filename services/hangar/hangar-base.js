import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { nonNegativeInteger } from '../validators.js'

const hangarBaseURL = 'https://hangar.papermc.io/api/v1'

// Thank you Modrinth friends for the base code! <3

const paginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(25),
  offset: nonNegativeInteger,
  count: nonNegativeInteger,
}).required()

// Unknown is used because Hangar's API can return more fields than we expect
// and we don't want to break if they add new fields.
// https://youtu.be/cBw0c-cmOfc?t=14

const versionArraySchema = Joi.array()
  .items(
    Joi.object({
      createdAt: Joi.string().isoDate().required(),
      name: Joi.string().required(),
      visibility: Joi.string()
        .valid('public', 'new', 'needsChanges', 'needsApproval', 'softDelete')
        .required(),
      description: Joi.string().allow(null).allow('').required(),
      stats: Joi.object({
        totalDownloads: nonNegativeInteger,
        platformDownloads: Joi.object()
          .pattern(/^/, Joi.number().min(0).required())
          .required(),
      })
        .unknown(true)
        .required(),
      author: Joi.string().required(),
      reviewState: Joi.string()
        .valid('unreviewed', 'reviewed', 'under_review', 'partially_reviewed')
        .required(),
      channel: Joi.object({
        createdAt: Joi.string().isoDate().required(),
        name: Joi.string().required(),
        // There are multiple valid colors, but we don't care about that
        color: Joi.string().required(),
        // See above.
        flags: Joi.array().items(Joi.string()).required(),
      })
        .unknown()
        .required(),
      pinnedStatus: Joi.string().required(),

      // Meant to match
      // "PAPER": {
      //   "fileInfo": null,
      //   "externalUrl": "https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/spigot",
      //   "downloadUrl": "https://hangarcdn.papermc.io/plugins/GeyserMC/Geyser/versions/Geyser/PAPER/null"
      // },
      // "WATERFALL": {
      //   "fileInfo": null,
      //   "externalUrl": "https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/bungeecord",
      //   "downloadUrl": "https://hangarcdn.papermc.io/plugins/GeyserMC/Geyser/versions/Geyser/WATERFALL/null"
      // },
      // "VELOCITY": {
      //   "fileInfo": null,
      //   "externalUrl": "https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/velocity",
      //   "downloadUrl": "https://hangarcdn.papermc.io/plugins/GeyserMC/Geyser/versions/Geyser/VELOCITY/null"
      // }
      downloads: Joi.object()
        .pattern(
          /^/,
          Joi.object({
            // Unknown
            fileInfo: Joi.object().unknown().allow(null).required(),
            externalUrl: Joi.string().allow(null).uri().required(),
            downloadUrl: Joi.string().allow(null).uri().required(),
          })
        )
        .required()
        .required(),
      postId: Joi.number().integer().min(0).allow(null).required(),
      pluginDependencies: Joi.object().allow(null).unknown().required(),
      platformDependencies: Joi.object().allow(null).unknown().required(),
      platformDependenciesFormatted: Joi.object()
        .pattern(/^/, Joi.string().allow(null).required())
        .required(),
    })
  )
  .required()

export const paginatedVersionResultSchema = Joi.object({
  pagination: paginationSchema,
  result: versionArraySchema,
}).required()

export const projectSchema = Joi.object({
  createdAt: Joi.string().isoDate().required(),
  lastUpdated: Joi.string().isoDate().allow(null).required(),
  name: Joi.string().required(),
  description: Joi.string().allow(null).allow('').required(),
  stats: Joi.object({
    downloads: nonNegativeInteger,
    views: nonNegativeInteger,
    recentViews: nonNegativeInteger,
    recentDownloads: nonNegativeInteger,
    stars: nonNegativeInteger,
    watchers: nonNegativeInteger,
  })
    .unknown(true)
    .required(),
})
  .unknown()
  .required()

const documentation =
  '<p>Use your user and project slug from your project page. If your project page is <code>https://hangar.papermc.io/SlimeDog/NetworkInterceptor</code> your user is SlimeDog and your slug is NetworkInterceptor</p>'

class BaseHangarService extends BaseJsonService {
  async fetchVersions({ project }) {
    console.log('fetching versions for', project)
    const bruh = {
      schema: paginatedVersionResultSchema,
      url: `${hangarBaseURL}/projects/${project}/versions?limit=1&offset=0`,
    }
    return this._requestJson(bruh)
  }

  async fetchProject({ project }) {
    return this._requestJson({
      schema: projectSchema,
      prefixUrl: hangarBaseURL,
      url: `${hangarBaseURL}/projects/${project}`,
    })
  }
}

export { BaseHangarService, documentation }
