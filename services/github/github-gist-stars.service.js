import gql from 'graphql-tag'
import Joi from 'joi'
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
}
