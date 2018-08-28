'use strict'

const BaseJsonService = require('../base-json')
const { InvalidResponse } = require('../errors')
const {
  circleSchema,
  getLatestCompleteBuildOutcome,
  summarizeBuildsForLatestCompleteWorkflow,
} = require('./circleci.helpers.js')

module.exports = class CircleCi extends BaseJsonService {
  async fetch({ token, vcsType, userRepo, branch }) {
    let url = `https://circleci.com/api/v1.1/project/${vcsType}/${userRepo}`
    if (branch != null) {
      url += `/tree/${branch}`
    }
    const query = { limit: 50 }
    if (token) {
      query['circle-token'] = token
    }
    return this._requestJson({
      url,
      schema: circleSchema,
      options: { qs: query },
      errorMessages: { 404: 'project not found' },
    })
  }

  static render({ status }) {
    let color = 'lightgrey'
    if (status === 'passing') {
      color = 'brightgreen'
    } else if (
      ['failed', 'infrastructure fail', 'canceled', 'timed out'].includes(status)
    ) {
      color = 'red'
    } else if (status === 'no tests') {
      color = 'yellow'
    }
    return { message: status, color }
  }

  async handle({ token, vcsType, userRepo, branch }) {
    const json = await this.fetch({ token, vcsType, userRepo, branch })
    try {
      const status =
        'workflows' in json[0]
          ? summarizeBuildsForLatestCompleteWorkflow(json)
          : getLatestCompleteBuildOutcome(json)
      return this.constructor.render({ status })
    } catch (e) {
      throw new InvalidResponse({
        prettyMessage: 'could not summarize build status',
      })
    }
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'build' }
  }

  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'circleci',
      format:
        '(?:token/(w+))?[+/]?project/(?:(github|bitbucket)/)?([^/]+/[^/]+)(?:/(.*))?',
      capture: ['token', 'vcsType', 'userRepo', 'branch'],
    }
  }

  static get examples() {
    return [
      {
        title: 'CircleCI (all branches)',
        exampleUrl: 'project/github/RedSparr0w/node-csgo-parser',
        urlPattern: 'project/:vcsType/:owner/:repo',
        staticExample: this.render({ status: 'passing' }),
      },
      {
        title: 'CircleCI branch',
        exampleUrl: 'project/github/RedSparr0w/node-csgo-parser/master',
        urlPattern: 'project/:vcsType/:owner/:repo/:branch',
        staticExample: this.render({ status: 'passing' }),
      },
      {
        title: 'CircleCI token',
        urlPattern:
          'circleci/token/:token/project/:vcsType/:owner/:repo/:branch',
        exampleUrl:
          'circleci/token/b90b5c49e59a4c67ba3a92f7992587ac7a0408c2/project/github/RedSparr0w/node-csgo-parser/master',
        staticExample: this.render({ status: 'passing' }),
      },
    ]
  }
}
