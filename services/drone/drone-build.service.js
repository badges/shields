'use strict'

const Joi = require('joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { BaseSvgScrapingService } = require('..')

const schema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('none'))
    .required(),
}).required()

module.exports = class DroneBuild extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'drone/build',
      pattern: ':user/:repo/:branch*',
    }
  }

  static get staticPreview() {
    return { message: 'success', color: 'brightgreen' }
  }

  static get defaultBadgeData() {
    return {
      label: 'build',
    }
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async handle({ user, repo, branch }) {
    const ref = branch ? `/refs/heads/${branch}` : undefined
    const { message: status } = await this._requestSvg({
      schema,
      url: `https://cloud.drone.io/api/badges/${user}/${repo}/status.svg`,
      options: { qs: { ref } },
      valueMatcher: />([^<>]+)<\/text><\/g>/,
    })

    return this.constructor.render({ status })
  }

  static get examples() {
    const { staticPreview } = this
    return [
      {
        title: 'Drone',
        pattern: ':user/:repo',
        namedParams: { user: 'drone', repo: 'drone' },
        staticPreview,
      },
      {
        title: 'Drone branch',
        pattern: ':user/:repo/:branch',
        namedParams: {
          user: 'drone',
          repo: 'drone',
          branch: 'master',
        },
        staticPreview,
      },
    ]
  }
}
