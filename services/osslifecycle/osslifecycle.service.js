'use strict'

const { BaseService, InvalidResponse } = require('..')

const documentation = `
<p>
  OSS Lifecycle is an initiative started by Netflix to classify open-source projects into lifecycles
  and clearly identify which projects are active and which ones are retired. To enable this badge, 
  simply create an OSSMETADATA tagging file at the root of your GitHub repository containing a 
  single line similar to the following: <code>osslifecycle=active</code>. Other suggested values are 
  <code>osslifecycle=maintenance</code> and <code>osslifecycle=archived</code>. A working example 
  can be viewed on the <a href="https://github.com/Netflix/osstracker">OSS Tracker repository</a>.
</p>
`

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
        documentation,
      },
      {
        title: 'OSS Lifecycle (branch)',
        pattern: ':user/:repo/:branch',
        namedParams: { user: 'Netflix', repo: 'osstracker', branch: 'master' },
        staticPreview: this.render({ status: 'active' }),
        keywords: ['Netflix'],
        documentation,
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
