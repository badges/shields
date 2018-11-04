'use strict'

const Joi = require('joi')
const BaseService = require('../base')
const BaseJsonService = require('../base-json')
const { metric } = require('../../lib/text-formatters')
const { InvalidResponse } = require('../errors')
const { nonNegativeInteger, anyInteger } = require('../validators')

const dockerBlue = '066da5' // see https://github.com/badges/shields/pull/1690

const buildDockerUrl = function(badgeName) {
  return {
    base: `docker/${badgeName}`,
    format: '([^/]+)/([^/]+)',
    capture: ['user', 'repo'],
  }
}

const getDockerHubUser = function(user) {
  return user === '_' ? 'library' : user
}

class DockerStars extends BaseService {
  async fetch({ user, repo }) {
    const url = `https://hub.docker.com/v2/repositories/${user}/${repo}/stars/count/`
    const { buffer } = await this._request({
      url,
      errorMessages: { 404: 'repo not found' },
    })
    const num = parseInt(buffer.toString(), 10)
    if (Number.isNaN(num)) {
      throw new InvalidResponse('Unexpected response.')
    }
    return num
  }

  static render({ stars }) {
    return {
      message: metric(stars),
      color: dockerBlue,
    }
  }

  async handle({ user, repo }) {
    const stars = await this.fetch({ user: getDockerHubUser(user), repo })
    return this.constructor.render({ stars })
  }

  static get defaultBadgeData() {
    return { label: 'docker stars' }
  }

  static get category() {
    return 'rating'
  }

  static get url() {
    return buildDockerUrl('stars')
  }

  static get examples() {
    return [
      {
        title: 'Docker Stars',
        exampleUrl: '_/ubuntu',
        urlPattern: ':user/:repo',
        keywords: ['docker', 'stars'],
        staticExample: this.render({ stars: 9000 }),
      },
    ]
  }
}

const pullsSchema = Joi.object({
  pull_count: nonNegativeInteger,
}).required()

class DockerPulls extends BaseJsonService {
  async fetch({ user, repo }) {
    return this._requestJson({
      schema: pullsSchema,
      url: `https://hub.docker.com/v2/repositories/${user}/${repo}`,
      errorMessages: { 404: 'repo not found' },
    })
  }

  static render({ count }) {
    return {
      message: metric(count),
      color: dockerBlue,
    }
  }

  async handle({ user, repo }) {
    const data = await this.fetch({
      user: getDockerHubUser(user),
      repo,
    })
    return this.constructor.render({ count: data.pull_count })
  }

  static get defaultBadgeData() {
    return { label: 'docker pulls' }
  }

  static get category() {
    return 'downloads'
  }

  static get url() {
    return buildDockerUrl('pulls')
  }

  static get examples() {
    return [
      {
        title: 'Docker Pulls',
        exampleUrl: '_/ubuntu',
        keywords: ['docker', 'pulls'],
        urlPattern: ':user/:repo',
        staticExample: this.render({ count: 765400000 }),
      },
    ]
  }
}

const buildSchema = Joi.object({
  results: Joi.array()
    .items(Joi.object({ status: anyInteger }).required())
    .required(),
}).required()

class DockerBuild extends BaseJsonService {
  async fetch({ user, repo }) {
    return this._requestJson({
      schema: buildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${user}/${repo}/buildhistory`,
      errorMessages: { 404: 'repo not found' },
    })
  }

  static render({ status }) {
    if (status === 10) {
      return { message: 'passing', color: 'brightgreen' }
    } else if (status < 0) {
      return { message: 'failing', color: 'red' }
    }
    return { message: 'building', color: dockerBlue }
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user: getDockerHubUser(user), repo })
    return this.constructor.render({ status: data.results[0].status })
  }

  static get category() {
    return 'build'
  }

  static get url() {
    return buildDockerUrl('build')
  }

  static get defaultBadgeData() {
    return { label: 'docker build' }
  }

  static get examples() {
    return [
      {
        title: 'Docker Build Status',
        exampleUrl: 'jrottenberg/ffmpeg',
        urlPattern: ':user/:repo',
        keywords: ['docker', 'build', 'status'],
        staticExample: this.render({ status: 10 }),
      },
    ]
  }
}

const automatedBuildSchema = Joi.object({
  is_automated: Joi.boolean().required(),
}).required()

class DockerAutomatedBuild extends BaseJsonService {
  async fetch({ user, repo }) {
    return this._requestJson({
      schema: automatedBuildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${user}/${repo}`,
      errorMessages: { 404: 'repo not found' },
    })
  }

  static render({ isAutomated }) {
    if (isAutomated) {
      return { message: 'automated', color: dockerBlue }
    } else {
      return { message: 'manual', color: 'yellow' }
    }
  }

  async handle({ user, repo }) {
    const data = await this.fetch({
      user: getDockerHubUser(user),
      repo,
    })
    return this.constructor.render({ isAutomated: data.is_automated })
  }

  static get category() {
    return 'build'
  }

  static get url() {
    return buildDockerUrl('automated')
  }

  static get defaultBadgeData() {
    return { label: 'docker build' }
  }

  static get examples() {
    return [
      {
        title: 'Docker Automated build',
        exampleUrl: 'jrottenberg/ffmpeg',
        urlPattern: ':user/:repo',
        keywords: ['docker', 'automated', 'build'],
        staticExample: this.render({ isAutomated: true }),
      },
    ]
  }
}

module.exports = {
  DockerStars,
  DockerPulls,
  DockerBuild,
  DockerAutomatedBuild,
}
