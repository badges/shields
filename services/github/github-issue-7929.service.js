import fs from 'fs'
import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({
  followers: nonNegativeInteger,
}).required()

export default class GithubIssue7929Service extends GithubAuthV3Service {
  static category = 'version'
  static route = {
    base: 'github/v/latest-branch-release',
    pattern: ':user/:repo/:branch',
  }
  static examples = [
    {
      title: 'GitHub latest branch release',
      namedParams: { user: 'laravel', repo: 'framework', branch: '10.x' },
      staticPreview: Object.assign(this.render({ releases: [] }), {
        label: 'Follow',
        style: 'social',
      }),
      queryParams: { label: 'Follow' },
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'latest@', namedLogo: 'github' }

  static render({ releases }) {
    return {
      message: releases?.length,
      color: 'blue',
    }
  }

  async handle({ user, repo, branch }) {
    const releases = await this._requestJson({
      url: `/repos/${user}/${repo}/releases?per_page=50`,
      schema,
      httpErrors: httpErrorsFor('user not found'),
    })

    fs.writeFileSync('./test.json', releases)

    console.log(releases)

    return this.constructor.render({ releases })
  }
}
