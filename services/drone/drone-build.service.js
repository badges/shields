'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { optionalUrl } = require('../validators')
const { BaseJsonService } = require('..')

const DroneBuildSchema = Joi.object({
  status: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('none'))
    .required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

module.exports = class DroneBuild extends BaseJsonService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      queryParamSchema,
      base: 'drone/build',
      pattern: ':user/:repo/:branch*',
    }
  }

  static get auth() {
    return { passKey: 'drone_token' }
  }

  static get examples() {
    return [
      {
        title: 'Drone (cloud)',
        pattern: ':user/:repo',
        namedParams: {
          user: 'drone',
          repo: 'drone',
        },
        staticPreview: renderBuildStatusBadge({ status: 'success' }),
      },
      {
        title: 'Drone (cloud) with branch',
        pattern: ':user/:repo/:branch',
        namedParams: {
          user: 'drone',
          repo: 'drone',
          branch: 'master',
        },
        staticPreview: renderBuildStatusBadge({ status: 'success' }),
      },
      {
        title: 'Drone (self-hosted)',
        pattern: ':user/:repo',
        queryParams: { server: 'https://drone.shields.io' },
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: renderBuildStatusBadge({ status: 'success' }),
      },
      {
        title: 'Drone (self-hosted) with branch',
        pattern: ':user/:repo/:branch',
        queryParams: { server: 'https://drone.shields.io' },
        namedParams: {
          user: 'badges',
          repo: 'shields',
          branch: 'feat/awesome-thing',
        },
        staticPreview: renderBuildStatusBadge({ status: 'success' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'build',
    }
  }

  async handle({ user, repo, branch }, { server }) {
    const options = {
      qs: {
        ref: branch ? `refs/heads/${branch}` : undefined,
      },
      headers: this.authHelper.bearerAuthHeader,
    }
    if (!server) {
      server = 'https://cloud.drone.io'
    }
    const json = await this._requestJson({
      options,
      schema: DroneBuildSchema,
      url: `${server}/api/repos/${user}/${repo}/builds/latest`,
      errorMessages: {
        401: 'repo not found or not authorized',
      },
    })
    return renderBuildStatusBadge({ status: json.status })
  }
}
