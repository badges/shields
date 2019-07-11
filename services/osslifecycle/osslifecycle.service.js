'use strict'

const { BaseService, InvalidResponse } = require('..')

module.exports = class OssTracker extends BaseService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'osslifecycle',
      pattern: ':user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'OSS Lifecycle',
        pattern: ':user/:repo',
        namedParams: { user: 'Netflix', repo: 'osstracker' },
        staticPreview: this.render({ status: 'active' }),
        keywords: ['Netflix'],
      },
      {
        title: 'OSS Lifecycle (branch)',
        pattern: ':user/:repo/:branch',
        namedParams: { user: 'Netflix', repo: 'osstracker', branch: 'master' },
        staticPreview: this.render({ status: 'active' }),
        keywords: ['Netflix'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'oss lifecycle' }
  }

  static render({ status }) {
    return {
      message: status,
      color: 'lightgrey',
    }
  }

  async fetch({ user, repo, branch }) {
    return this._request({
      url: `https://raw.githubusercontent.com/${user}/${repo}/${branch}/OSSMETADATA`,
    })
  }

  async handle({ user, repo, branch }) {
    const { buffer } = await this.fetch({
      user,
      repo,
      branch: branch || 'master',
    })
    try {
      const status = buffer.match(/osslifecycle=([a-z]+)/im)[1]
      return this.constructor.render({ status })
    } catch (e) {
      throw new InvalidResponse({
        prettyMessage: 'metadata in unexpected format',
      })
    }
  }
}
