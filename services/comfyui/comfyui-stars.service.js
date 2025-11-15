import ComfyuiBase, { comfyuiGeneralParams } from './comfyui-base.js'

export default class ComfyuiStars extends ComfyuiBase {
  static category = 'social'
  static route = { base: 'comfyui', pattern: ':node/stars' }

  static openApi = {
    '/comfyui/{node}/stars': {
      get: {
        summary: 'ComfyUI node GitHub stars',
        parameters: comfyuiGeneralParams,
      },
    },
  }

  static defaultBadgeData = { label: 'stars' }

  async handle({ node }) {
    const data = await this.fetch({ node })
    const stars = data.github_stars
    const message = stars == null ? 'unknown' : String(stars)
    return {
      label: 'stars',
      message,
      color: stars == null ? 'lightgrey' : 'blue',
    }
  }
}
