'use strict'

const { addv } = require('../text-formatters')
const { fetchLatestRelease } = require('./github-common-fetch')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation } = require('./github-helpers')

module.exports = class GithubRelease extends GithubAuthV3Service {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github',
      pattern: ':variant(release|release-pre)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub release',
        namedParams: {
          variant: 'release',
          user: 'qubyte',
          repo: 'rubidium',
        },
        staticPreview: this.render({ version: '2.0.2', isPrerelease: false }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'release',
      namedLogo: 'github',
    }
  }

  static render({ version, isPrerelease }) {
    return {
      message: addv(version),
      color: isPrerelease ? 'orange' : 'blue',
    }
  }

  async handle({ variant, user, repo }) {
    const {
      tag_name: version,
      prerelease: isPrerelease,
    } = await fetchLatestRelease(this, {
      user,
      repo,
      includePre: variant === 'release-pre',
    })
    return this.constructor.render({ version, isPrerelease })
  }
}
