import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import {
  BaseSvgScrapingService,
  redirector,
  pathParam,
  queryParam,
} from '../index.js'

const circleSchema = Joi.object({ message: isBuildStatus }).required()
const queryParamSchema = Joi.object({ token: Joi.string() }).required()

const tokenDescription = `
You may specify an optional token to get the status for a private repository.

If you need to use a token, please use a <b>Project Token</b> and only assign your token the 'Status' permission. Never use a <b>Personal Token</b> as they grant full read write permissions to your projects.

For more information about managing Circle CI tokens, please read this <a target="_blank" href="https://circleci.com/docs/2.0/managing-api-tokens">article</a>.
`

const vcsTypeMap = { gh: 'gh', github: 'gh', bb: 'bb', bitbucket: 'bb' }

class CircleCi extends BaseSvgScrapingService {
  static category = 'build'
  static route = {
    base: 'circleci/build',
    pattern: ':vcsType(github|gh|bitbucket|bb)/:user/:repo/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/circleci/build/{vcsType}/{user}/{repo}': {
      get: {
        summary: 'CircleCI',
        parameters: [
          pathParam({
            name: 'vcsType',
            schema: { type: 'string', enum: this.getEnum('vcsType') },
            example: 'github',
          }),
          pathParam({
            name: 'user',
            example: 'RedSparr0w',
          }),
          pathParam({
            name: 'repo',
            example: 'node-csgo-parser',
          }),
          queryParam({
            name: 'token',
            example: 'abc123def456',
            description: tokenDescription,
          }),
        ],
      },
    },
    '/circleci/build/{vcsType}/{user}/{repo}/{branch}': {
      get: {
        summary: 'CircleCI (branch)',
        parameters: [
          pathParam({
            name: 'vcsType',
            schema: { type: 'string', enum: this.getEnum('vcsType') },
            example: 'github',
          }),
          pathParam({
            name: 'user',
            example: 'RedSparr0w',
          }),
          pathParam({
            name: 'repo',
            example: 'node-csgo-parser',
          }),
          pathParam({
            name: 'branch',
            example: 'master',
          }),
          queryParam({
            name: 'token',
            example: 'abc123def456',
            description: tokenDescription,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'build' }

  static render({ status }) {
    return renderBuildStatusBadge({ status: status.replace('_', ' ') })
  }

  async handle({ vcsType, user, repo, branch }, { token }) {
    const branchClause = branch ? `/tree/${branch}` : ''
    const vcs = vcsTypeMap[vcsType]
    const { message } = await this._requestSvg({
      schema: circleSchema,
      url: `https://circleci.com/${vcs}/${user}/${repo}${branchClause}.svg`,
      // Note that the unusual 'circle-token' query param name is required.
      // https://circleci.com/docs/api/#get-authenticated
      options: { searchParams: { style: 'shield', 'circle-token': token } },
      httpErrors: { 404: 'project not found' },
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

export default { ...legacyRoutes, CircleCi }
