import gql from 'graphql-tag'
import Joi from 'joi'
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
  static examples = [
    {
      title: 'GitHub forks',
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      // TODO: This is currently a literal, as `staticPreview` doesn't
      // support `link`.
      staticPreview: {
        label: 'Fork',
        message: '150',
        style: 'social',
      },
      // staticPreview: {
      //   ...this.render({ user: 'badges', repo: 'shields', forkCount: 150 }),
      //   label: 'fork',
      //   style: 'social',
      // },
      queryParams: { label: 'Fork' },
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'forks', namedLogo: 'github' }

  static render({ user, repo, forkCount }) {
    return {
      message: metric(forkCount),
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
