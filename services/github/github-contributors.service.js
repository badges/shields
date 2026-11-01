import Joi from 'joi'
import parseLinkHeader from 'parse-link-header'
import { InvalidResponse, pathParams } from '../index.js'
import { renderContributorBadge } from '../contributor-count.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

// All we do is check its length.
const schema = Joi.array().items(Joi.object())

const documentationWithNote = [
  documentation,
  'Note: Co-authors are not included in the count due to endpoint limitations.',
  "For repositories whose history or contributor list is too large for GitHub's API to compute, the badge shows `High contributor count`.",
].join('\n\n')

export default class GithubContributors extends GithubAuthV3Service {
  static category = 'activity'
  static route = {
    base: 'github',
    // note we call this param 'metric' instead of 'variant' because of
    // https://github.com/badges/shields/issues/10323
    pattern: ':metric/:user/:repo',
  }

  static routeEnum = ['contributors', 'contributors-anon']

  static openApi = {
    '/github/{metric}/{user}/{repo}': {
      get: {
        summary: 'GitHub contributors',
        description: documentationWithNote,
        parameters: pathParams(
          {
            name: 'metric',
            example: 'contributors',
            schema: { type: 'string', enum: this.getEnum('metric') },
            description:
              '`contributors-anon` includes anonymous commits, whereas `contributors` excludes them.',
          },
          {
            name: 'user',
            example: 'cdnjs',
          },
          {
            name: 'repo',
            example: 'cdnjs',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'contributors' }

  static render({ contributorCount }) {
    return renderContributorBadge({ contributorCount })
  }

  async handle({ metric, user, repo }) {
    const isAnon = metric === 'contributors-anon'

    let res
    let buffer
    try {
      ;({ res, buffer } = await this._request({
        url: `/repos/${user}/${repo}/contributors`,
        options: { searchParams: { page: '1', per_page: '1', anon: isAnon } },
        httpErrors: httpErrorsFor('repo not found'),
      }))
    } catch (error) {
      if (
        error.response?.statusCode === 403 &&
        /history or contributor list is too large/i.test(
          error.buffer?.toString(),
        )
      ) {
        throw new InvalidResponse({ prettyMessage: 'High contributor count' })
      }
      throw error
    }

    const parsed = parseLinkHeader(res.headers.link)
    let contributorCount
    if (parsed === null) {
      const json = this._parseJson(buffer)
      const contributorInfo = this.constructor._validate(json, schema)
      contributorCount = contributorInfo.length
    } else {
      contributorCount = +parsed.last.page
    }

    return this.constructor.render({ contributorCount })
  }
}
