import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const nodeSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().allow('', null),
  downloads: Joi.number().integer().min(0).required(),
  github_stars: Joi.number().integer().min(0).allow(null),
  latest_version: Joi.object({ version: Joi.string().required() }).required(),
}).required()

class BaseComfyuiService extends BaseJsonService {
  static category = 'other'

  async fetchNode({ node }) {
    const url = `https://api.comfy.org/nodes/${encodeURIComponent(node)}`
    return await this._requestJson({
      schema: nodeSchema,
      url,
      options: { timeout: { request: 10000 } },
    })
  }
}

export class ComfyuiDownloads extends BaseComfyuiService {
  static category = 'downloads'
  // Short URL: /comfyui/:node/downloads
  static route = { base: 'comfyui', pattern: ':node/downloads' }

  static openApi = {
    '/comfyui/{node}/downloads': {
      get: {
        summary: 'ComfyUI node downloads',
        parameters: pathParams({
          name: 'node',
          example: 'comfyui-image-captioner',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ node }) {
    const data = await this.fetchNode({ node })
    const downloads = data.downloads
    return renderDownloadsBadge({ downloads, labelOverride: 'downloads' })
  }
}

export class ComfyuiVersion extends BaseComfyuiService {
  static category = 'version'
  // Short URL: /comfyui/:node/version
  static route = { base: 'comfyui', pattern: ':node/version' }

  static openApi = {
    '/comfyui/{node}/version': {
      get: {
        summary: 'ComfyUI node version',
        parameters: pathParams({
          name: 'node',
          example: 'comfyui-image-captioner',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'version' }

  async handle({ node }) {
    const data = await this.fetchNode({ node })
    const version = data.latest_version && data.latest_version.version
    const rawLabel =
      (typeof data.name === 'string' && data.name.trim()) ||
      (typeof data.id === 'string' && data.id.trim()) ||
      (typeof node === 'string' ? node.trim() : node)
    const label =
      typeof rawLabel === 'string' && rawLabel
        ? rawLabel.toLowerCase()
        : 'version'
    // Prefer the node's human-friendly name when available, but ensure badge
    // labels stay lowercase for consistency.
    return renderVersionBadge({ version, defaultLabel: label })
  }
}

export class ComfyuiStars extends BaseComfyuiService {
  static category = 'social'
  // Short URL: /comfyui/:node/stars
  static route = { base: 'comfyui', pattern: ':node/stars' }

  static openApi = {
    '/comfyui/{node}/stars': {
      get: {
        summary: 'ComfyUI node GitHub stars',
        parameters: pathParams({
          name: 'node',
          example: 'comfyui-image-captioner',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'stars' }

  async handle({ node }) {
    const data = await this.fetchNode({ node })
    const stars = data.github_stars
    const message = stars == null ? 'unknown' : String(stars)
    return {
      label: 'stars',
      message,
      color: stars == null ? 'lightgrey' : 'blue',
    }
  }
}
