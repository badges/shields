import gql from 'graphql-tag'
import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { documentation, transformErrors } from './github-helpers.js'

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      forkCount: nonNegativeInteger,
    }).required(),
  }).required(),
}).required()

export default class GithubForks extends GithubAuthV4Service {
  static category = 'social'
  static route = { base: 'github/forks', pattern: ':user/:repo' }
  static openApi = {
    '/github/forks/{user}/{repo}': {
      get: {
        summary: 'GitHub forks',
        description: documentation,
        parameters: pathParams(
          { name: 'user', example: 'badges' },
          { name: 'repo', example: 'shields' },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'forks', namedLogo: 'github' }

  static render({ user, repo, forkCount }) {
    return {
      message: metric(forkCount),
      style: 'social',
      color: 'blue',
      link: [
        `https://github.com/${user}/${repo}/fork`,
        `https://github.com/${user}/${repo}/network`,
      ],
    }
  }

  async handle({ user, repo }) {
    const json = await this._requestGraphql({
      query: gql`
        query ($user: String!, $repo: String!) {
          repository(owner: $user, name: $repo) {
            forkCount
          }
        }
      `,
      variables: { user, repo },
      schema,
      transformErrors,
    })
    return this.constructor.render({
      user,
      repo,
      forkCount: json.data.repository.forkCount,
    })
  }
}
