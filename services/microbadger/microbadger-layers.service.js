'use strict'

const BaseMicrobadgerService = require('./microbadger-base')

module.exports = class MicrobadgerLayers extends BaseMicrobadgerService {
  static route = {
    base: 'microbadger/layers',
    pattern: ':user/:repo/:tag*',
  }

  static examples = [
    {
      title: 'MicroBadger Layers',
      pattern: ':user/:repo',
      namedParams: { user: '_', repo: 'alpine' },
      staticPreview: this.render({ layers: 15 }),
      keywords: ['docker'],
    },
    {
      title: 'MicroBadger Layers (tag)',
      pattern: ':user/:repo/:tag',
      namedParams: { user: '_', repo: 'alpine', tag: '2.7' },
      staticPreview: this.render({ layers: 12 }),
      keywords: ['docker'],
    },
  ]

  static defaultBadgeData = { label: 'layers' }

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
