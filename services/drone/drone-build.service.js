'use strict'

const Joi = require('joi')
const serverSecrets = require('../../lib/server-secrets')
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
      base: 'drone',
      pattern: ':scheme(http|https)?/:host/build/:user/:repo/:branch*',
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

  async handle({ scheme, host, user, repo, branch }) {
    const ref = branch ? `refs/heads/${branch}` : undefined
    const options = { qs: { ref } }
    if (host === 'cloud') {
      scheme = 'https'
      host = 'cloud.drone.io'
    }
    if (serverSecrets.drone_token) {
      options.headers = {
        Authorization: `Bearer ${serverSecrets.drone_token}`,
      }
    }
    const json = await this._requestJson({
      schema,
      url: `${scheme}://${host}/api/repos/${user}/${repo}/builds/latest`,
      options,
    })
    return this.constructor.render({
      status: json.status,
    })
  }

  static get examples() {
    return [
      {
        title: 'Drone (cloud)',
        pattern: 'cloud/build/:user/:repo',
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
        title: 'Drone (cloud) with branch',
        pattern: 'cloud/build/:user/:repo/:branch',
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
      {
        title: 'Drone (self-hosted)',
        pattern: 'https/drone.shields.io/build/:user/:repo',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: {
          label: 'build',
          message: 'success',
          color: 'brightgreen',
        },
      },
      {
        title: 'Drone (self-hosted) with branch',
        pattern: 'https/drone.shields.io/build/:user/:repo/:branch',
        namedParams: {
          user: 'badges',
          repo: 'shields',
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
