import { renderDownloadsBadge } from '../downloads.js'
import ComfyuiBase, { comfyuiGeneralParams } from './comfyui-base.js'

export default class ComfyuiDownloads extends ComfyuiBase {
  static category = 'downloads'
  static route = { base: 'comfyui', pattern: ':node/downloads' }

  static openApi = {
    '/comfyui/{node}/downloads': {
      get: {
        summary: 'ComfyUI node downloads',
        parameters: comfyuiGeneralParams,
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ node }) {
    const data = await this.fetch({ node })
    const downloads = data.downloads
    return renderDownloadsBadge({ downloads, labelOverride: 'downloads' })
  }
}
