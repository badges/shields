'use strict'

const BaseMicrobadgerService = require('./microbadger-base')

module.exports = class MicrobadgerVersion extends BaseMicrobadgerService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'microbadger/version',
      pattern: ':user/:repo/:tag*',
    }
  }

  static get examples() {
    return [
      {
        title: 'MicroBadger Version',
        pattern: ':user/:repo',
        namedParams: { user: '_', repo: 'alpine' },
        staticPreview: this.render({ version: '3.11.2' }),
        keywords: ['docker'],
      },
      {
        title: 'MicroBadger Version (tag)',
        pattern: ':user/:repo/:tag',
        namedParams: { user: '_', repo: 'alpine', tag: '3.10' },
        staticPreview: this.render({ version: '3.10.3' }),
        keywords: ['docker'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'version' }
  }

  static render({ version }) {
    return {
      message: version,
      color: 'blue',
    }
  }

  async handle({ user, repo, tag }) {
    const versionlookup = true
    const data = await this.fetch({ user, repo, tag })
    const image = this.constructor.getImage(data, tag, versionlookup)
    return this.constructor.render({ version: image.LatestVersion })
  }
}
