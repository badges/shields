import { renderVersionBadge } from '../version.js'
import { NotFound } from '../index.js'
import ComfyuiBase, { comfyuiGeneralParams } from './comfyui-base.js'

export default class ComfyuiVersion extends ComfyuiBase {
  static category = 'version'

  static route = { base: 'comfyui', pattern: ':node/version' }

  static openApi = {
    '/comfyui/{node}/version': {
      get: {
        summary: 'ComfyUI - Version',
        parameters: comfyuiGeneralParams,
      },
    },
  }

  static defaultBadgeData = { label: 'comfyui' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ node }, { comfyuiBaseUrl }) {
    const data = await this.fetch({ node, comfyuiBaseUrl })

    const version =
      (data && data.latest_version && data.latest_version.version) ||
      data.version ||
      (data.info && data.info.version) ||
      (data.latest && data.latest.version) ||
      null

    if (!version) {
      throw new NotFound({ prettyMessage: 'version not found' })
    }

    return this.constructor.render({ version })
  }
}
