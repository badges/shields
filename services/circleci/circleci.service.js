'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

const circleSchema = Joi.array()
  .items(Joi.object({ status: Joi.string().required() }))
  .min(1)
  .max(1)
  .required()

const documentation = `
  <p>
    Please note that <code>status</code> tokens will not work. Instead, you should generate an <code>all</code> scoped token.
    <br />
    For the sake of security, please use <b>Project Tokens</b> and never <b>Personal Tokens</b> as they grant full read write permissions to your projects.
    <br />
    For more information about managing Circle CI tokens, please read this <a target="_blank" href="https://circleci.com/docs/2.0/managing-api-tokens">article</a>.
  </p>
  `

module.exports = class CircleCi extends BaseJsonService {
  async fetch({ token, vcsType, userRepo, branch }) {
    let url = `https://circleci.com/api/v1.1/project/${vcsType}/${userRepo}`
    if (branch != null) {
      url += `/tree/${branch}`
    }
    const query = { filter: 'completed', limit: 1 }
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
    if (['success', 'fixed'].includes(status)) {
      return { message: 'passing', color: 'brightgreen' }
    } else if (status === 'failed') {
      return { message: 'failed', color: 'red' }
    } else if (['no_tests', 'scheduled', 'not_run'].includes(status)) {
      return { message: status.replace('_', ' '), color: 'yellow' }
    } else {
      return { message: status.replace('_', ' '), color: 'lightgrey' }
    }
  }

  async handle({ token, vcsType, userRepo, branch }) {
    const json = await this.fetch({
      token,
      vcsType: vcsType || 'github',
      userRepo,
      branch,
    })
    return this.constructor.render({ status: json[0].status })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'build' }
  }

  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'circleci',
      format:
        '(?:token/(\\w+)/)?project/(?:(github|bitbucket)/)?([^/]+/[^/]+)(?:/(.*))?',
      capture: ['token', 'vcsType', 'userRepo', 'branch'],
    }
  }

  static get examples() {
    return [
      {
        title: 'CircleCI (all branches)',
        exampleUrl: 'project/github/RedSparr0w/node-csgo-parser',
        pattern: 'project/:vcsType/:owner/:repo',
        staticExample: this.render({ status: 'success' }),
      },
      {
        title: 'CircleCI branch',
        exampleUrl: 'project/github/RedSparr0w/node-csgo-parser/master',
        pattern: 'project/:vcsType/:owner/:repo/:branch',
        staticExample: this.render({ status: 'success' }),
      },
      {
        title: 'CircleCI token',
        pattern: 'token/:token/project/:vcsType/:owner/:repo/:branch',
        exampleUrl:
          'token/b90b5c49e59a4c67ba3a92f7992587ac7a0408c2/project/github/RedSparr0w/node-csgo-parser/master',
        staticExample: this.render({ status: 'success' }),
        documentation,
      },
    ]
  }
}
