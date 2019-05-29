'use strict'

const Joi = require('joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { BaseSvgScrapingService, redirector } = require('..')

const circleSchema = Joi.object({ message: isBuildStatus }).required()
const queryParamSchema = Joi.object({ token: Joi.string() }).required()

const documentation = `
  <p>
    You may specify an optional token to get the status for a private repository.
    <br />
    If you need to use a token, please use a <b>Project Token</b> and only assign your token the 'Status' permission. Never use a <b>Personal Token</b> as they grant full read write permissions to your projects.
    <br />
    For more information about managing Circle CI tokens, please read this <a target="_blank" href="https://circleci.com/docs/2.0/managing-api-tokens">article</a>.
  </p>
  `

const vcsTypeMap = { gh: 'gh', github: 'gh', bb: 'bb', bitbucket: 'bb' }

class CircleCi extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'circleci/build',
      pattern: ':vcsType(github|gh|bitbucket|bb)/:user/:repo/:branch*',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'CircleCI',
        namedParams: {
          vcsType: 'github',
          user: 'RedSparr0w',
          repo: 'node-csgo-parser',
          branch: 'master',
        },
        queryParams: {
          token: 'abc123def456',
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

  async handle({ vcsType, user, repo, branch }, { token }) {
    const branchClause = branch ? `/tree/${branch}` : ''
    const vcs = vcsTypeMap[vcsType]
    const { message } = await this._requestSvg({
      schema: circleSchema,
      url: `https://circleci.com/${vcs}/${user}/${repo}${branchClause}.svg`,
      options: { qs: { style: 'shield', token } },
      errorMessages: { 404: 'project not found' },
    })
    return this.constructor.render({ status: message })
  }
}

const legacyRoutes = [
  redirector({
    category: 'build',
    route: {
      base: 'circleci/token',
      pattern:
        ':token/project/:vcsType(github|bitbucket)?/:user/:repo/:branch*',
    },
    transformPath: ({ vcsType, user, repo, branch }) => {
      const vcs = vcsType || 'gh'
      return `/circleci/build/${vcs}/${user}/${repo}${
        branch ? `/${branch}` : ''
      }`
    },
    transformQueryParams: ({ token }) => ({ token }),
    dateAdded: new Date('2019-05-05'),
  }),
  redirector({
    category: 'build',
    route: {
      base: 'circleci/project',
      pattern: ':vcsType(github|bitbucket)?/:user/:repo/:branch*',
    },
    transformPath: ({ vcsType, user, repo, branch }) => {
      const vcs = vcsType || 'gh'
      return `/circleci/build/${vcs}/${user}/${repo}${
        branch ? `/${branch}` : ''
      }`
    },
    dateAdded: new Date('2019-05-05'),
  }),
]

module.exports = [...legacyRoutes, CircleCi]
