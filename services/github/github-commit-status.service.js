import Joi from 'joi'
import { NotFound, InvalidParameter } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

const schema = Joi.object({
  // https://stackoverflow.com/a/23969867/893113
  status: Joi.equal('identical', 'ahead', 'behind', 'diverged'),
}).required()

export default class GithubCommitStatus extends GithubAuthV3Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github/commit-status',
    pattern: ':user/:repo/:branch/:commit',
  }

  static examples = [
    {
      title: 'GitHub commit merge status',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        branch: 'master',
        commit: '5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c',
      },
      staticPreview: this.render({
        isInBranch: true,
        branch: 'master',
      }),
      keywords: ['branch'],
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'commit status' }

  static render({ isInBranch, branch }) {
    if (isInBranch) {
      return {
        message: `in ${branch}`,
        color: 'brightgreen',
      }
    } else {
      // status: ahead or diverged
      return {
        message: `not in ${branch}`,
        color: 'yellow',
      }
    }
  }

  async handle({ user, repo, branch, commit }) {
    let status
    try {
      ;({ status } = await this._requestJson({
        url: `/repos/${user}/${repo}/compare/${branch}...${commit}`,
        errorMessages: errorMessagesFor('commit or branch not found'),
        schema,
      }))
    } catch (e) {
      if (e instanceof NotFound) {
        const { message } = this._parseJson(e.buffer)
        if (message && message.startsWith('No common ancestor between')) {
          throw new InvalidParameter({ prettyMessage: 'no common ancestor' })
        }
      }
      throw e
    }

    const isInBranch = status === 'identical' || status === 'behind'
    return this.constructor.render({ isInBranch, branch })
  }
}
