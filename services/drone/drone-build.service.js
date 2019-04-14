'use strict'

const Joi = require('joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  status: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('none'))
    .required(),
}).required()

module.exports = class DroneBuild extends BaseJsonService {
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
    return {
      message: 'success',
      color: 'brightgreen',
    }
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
    const ref = branch ? `refs/heads/${branch}` : undefined
    const json = await this._requestJson({
      schema,
      url: `https://cloud.drone.io/api/repos/${user}/${repo}/builds/latest`,
      options: { qs: { ref } },
    })
    return this.constructor.render({
      status: json.status,
    })
  }

  static get examples() {
    return [
      {
        title: 'Drone',
        pattern: ':user/:repo',
        namedParams: {
          user: 'drone',
          repo: 'drone',
        },
        staticPreview: {
          label: 'build',
          message: 'success',
          color: 'brightgreen',
        },
      },
      {
        title: 'Drone branch',
        pattern: ':user/:repo/:branch',
        namedParams: {
          user: 'drone',
          repo: 'drone',
          branch: 'master',
        },
        staticPreview: {
          label: 'build',
          message: 'success',
          color: 'brightgreen',
        },
      },
    ]
  }
}
