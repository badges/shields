'use strict'

const Joi = require('joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { BaseSvgScrapingService } = require('..')

const circleSchema = Joi.object({ message: isBuildStatus }).required()

const documentation = `
  <p>
    If you need to use a token, please use a <b>Project Token</b> and only assign your token the 'Status' permission. Never use a <b>Personal Token</b> as they grant full read write permissions to your projects.
    <br />
    For more information about managing Circle CI tokens, please read this <a target="_blank" href="https://circleci.com/docs/2.0/managing-api-tokens">article</a>.
  </p>
  `

const vcsTypeMap = { gh: 'gh', github: 'gh', bb: 'bb', bitbucket: 'bb' }

module.exports = class CircleCi extends BaseSvgScrapingService {
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
        pattern: 'project/:vcsType/:owner/:repo',
        namedParams: {
          vcsType: 'github',
          owner: 'RedSparr0w',
          repo: 'node-csgo-parser',
        },
        staticPreview: this.render({ status: 'success' }),
      },
      {
        title: 'CircleCI branch',
        pattern: 'project/:vcsType/:owner/:repo/:branch',
        namedParams: {
          vcsType: 'github',
          owner: 'RedSparr0w',
          repo: 'node-csgo-parser',
          branch: 'master',
        },
        staticPreview: this.render({ status: 'success' }),
      },
      {
        title: 'CircleCI token',
        pattern: 'token/:token/project/:vcsType/:owner/:repo/:branch',
        namedParams: {
          token: 'b90b5c49e59a4c67ba3a92f7992587ac7a0408c2',
          vcsType: 'github',
          owner: 'RedSparr0w',
          repo: 'node-csgo-parser',
          branch: 'master',
        },
        staticPreview: this.render({ status: 'success' }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'build' }
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status: status.replace('_', ' ') })
  }

  async handle({ token, vcsType, userRepo, branch }) {
    const branchClause = branch ? `/tree/${branch}` : ''
    const vcs = vcsTypeMap[vcsType] || 'gh'
    const { message } = await this._requestSvg({
      schema: circleSchema,
      url: `https://circleci.com/${vcs}/${userRepo}${branchClause}.svg`,
      options: { qs: { style: 'shield', token } },
      errorMessages: { 404: 'project not found' },
    })
    return this.constructor.render({ status: message })
  }
}
