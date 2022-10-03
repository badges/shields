import gql from 'graphql-tag'
import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { NotFound } from '../index.js'
import { GithubAuthV4Service } from './github-auth-service.js'

const schema = Joi.object({
  data: Joi.object({
    viewer: Joi.object({
      gist: Joi.object({
        stargazerCount: Joi.number(),
        url: Joi.string(),
      }).allow(null),
    }).required(),
  }).required(),
}).required()

export default class GithubGistStars extends GithubAuthV4Service {
  static category = 'social'

  static route = {
    base: 'github/stars/gists',
    pattern: ':gist',
  }

  static defaultBadgeData = {
    label: 'Stars',
    color: 'blue',
    namedLogo: 'github',
  }

  static render({ stargazerCount, url }) {
    return { message: metric(stargazerCount), link: [url] }
  }

  async fetch({ gist }) {
    const data = await this._requestGraphql({
      query: gql`
        query ($gist: String!) {
          viewer {
            gist(name: $gist) {
              stargazerCount
              url
            }
          }
        }
      `,
      variables: {
        gist,
      },
      schema,
    })
    return data
  }

  static transform({ data }) {
    const {
      data: {
        viewer: { gist },
      },
    } = data

    if (!gist) {
      throw new NotFound({ prettyMessage: 'gist not found' })
    }

    const { stargazerCount, url } = gist

    return { stargazerCount, url }
  }

  async handle({ gist }) {
    const data = await this.fetch({ gist })
    const { stargazerCount, url } = await this.constructor.transform({
      data,
    })
    return this.constructor.render({ stargazerCount, url })
  }
}
