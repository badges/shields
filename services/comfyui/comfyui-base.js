import Joi from 'joi'
import config from 'config'
import { BaseJsonService, queryParam, pathParam } from '../index.js'

const schema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().allow('', null),
  downloads: Joi.number().integer().min(0).required(),
  github_stars: Joi.number().integer().min(0).allow(null),
  // Accept several possible shapes for the version info so we are robust
  // against minor API shape changes. The handler will pick the most
  // appropriate field when rendering.
  latest_version: Joi.object({ version: Joi.string().required() }).optional(),
  version: Joi.string().optional(),
  info: Joi.object({ version: Joi.string().optional() }).optional(),
  latest: Joi.object({ version: Joi.string().optional() }).optional(),
}).required()

export const comfyuiBaseUrlParam = queryParam({
  name: 'comfyuiBaseUrl',
  example: 'https://api.comfy.org/nodes',
  description: 'Base URL for the ComfyUI nodes API',
})

export const comfyuiNodeParam = pathParam({
  name: 'node',
  example: 'comfyui-image-captioner',
})

export const comfyuiGeneralParams = [comfyuiNodeParam, comfyuiBaseUrlParam]

export default class ComfyuiBase extends BaseJsonService {
  static buildRoute(base) {
    return {
      base,
      pattern: ':node',
    }
  }

  async fetch({ node, comfyuiBaseUrl = null }) {
    const cfg =
      config.util && typeof config.util.toObject === 'function'
        ? config.util.toObject()
        : {}
    const defaultComfyuiBaseUrl =
      cfg?.public?.services?.comfyui?.baseUri || 'https://api.comfy.org/nodes'
    comfyuiBaseUrl = comfyuiBaseUrl || defaultComfyuiBaseUrl
    return this._requestJson({
      schema,
      url: `${comfyuiBaseUrl}/${encodeURIComponent(node)}`,
      httpErrors: { 404: 'node not found' },
    })
  }
}
