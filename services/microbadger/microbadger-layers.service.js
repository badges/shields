'use strict'

const BaseMicrobadgerService = require('./microbadger-base')

module.exports = class MicrobadgerLayers extends BaseMicrobadgerService {
  static get route() {
    return {
      base: 'microbadger/layers',
      pattern: ':user/:repo/:tag*',
    }
  }

  static get defaultBadgeData() {
    return { label: 'layers' }
  }

  static get examples() {
    return [
      {
        title: 'MicroBadger Layers',
        pattern: 'layers/:imageId+',
        namedParams: { imageId: '_/alpine' },
        staticPreview: this.render({ layers: 15 }),
        keywords: ['docker'],
      },
      {
        title: 'MicroBadger Layers (tag)',
        pattern: 'layers/:imageId+/:tag',
        namedParams: { imageId: '_/alpine', tag: '2.7' },
        staticPreview: this.render({ layers: 12 }),
        keywords: ['docker'],
      },
    ]
  }

  static render({ layers }) {
    return {
      message: layers,
      color: 'blue',
    }
  }

  async handle({ user, repo, tag }) {
    const data = await this.fetch({ user, repo })
    const image = this.constructor.getImage(data, tag)
    return this.constructor.render({ layers: image.LayerCount })
  }
}
