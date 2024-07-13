import Joi from 'joi'
import gql from 'graphql-tag'
import { pathParam, queryParam } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import {
  documentation as commonDocumentation,
  transformErrors,
} from './github-helpers.js'

const MAX_REPO_LIMIT = 200

const description = `${commonDocumentation}

<b>Note:</b> This badge takes into account up to <code>${MAX_REPO_LIMIT}</code> of the most starred repositories of given user / org.
`

const affiliationsDescription = `This param accepts three values (must be UPPER case) <code>OWNER</code>, <code>COLLABORATOR</code>, <code>ORGANIZATION_MEMBER</code>.
One can pass comma separated combinations of these values (no spaces) e.g. <code>OWNER,COLLABORATOR</code> or <code>OWNER,COLLABORATOR,ORGANIZATION_MEMBER</code>.
Default value is <code>OWNER</code>. See the explanation of these values <a href="https://docs.github.com/en/graphql/reference/enums#repositoryaffiliation">here</a>.`

const pageInfoSchema = Joi.object({
  hasNextPage: Joi.boolean().required(),
  endCursor: Joi.string().allow(null).required(),
}).required()

const nodesSchema = Joi.array()
  .items(
    Joi.object({
      stargazers: Joi.object({
        totalCount: nonNegativeInteger,
      }).required(),
    }),
  )
  .default([])

const repositoriesSchema = Joi.object({
  pageInfo: pageInfoSchema,
  nodes: nodesSchema,
}).required()

const schema = Joi.object({
  data: Joi.alternatives(
    Joi.object({
      user: Joi.object({
        repositories: repositoriesSchema,
      }).required(),
    }).required(),
    Joi.object({
      organization: Joi.object({
        repositories: repositoriesSchema,
      }).required(),
    }).required(),
  ).required(),
}).required()

const query = gql`
  query fetchStars(
    $user: String!
    $nextCursor: String
    $affiliations: [RepositoryAffiliation]!
  ) {
    user(login: $user) {
      repositories(
        first: 100
        after: $nextCursor
        ownerAffiliations: $affiliations
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          stargazers {
            totalCount
          }
        }
      }
    }

    organization(login: $user) {
      repositories(
        first: 100
        after: $nextCursor
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          stargazers {
            totalCount
          }
        }
      }
    }
  }
`

const affiliationsAllowedValues = [
  'OWNER',
  'COLLABORATOR',
  'ORGANIZATION_MEMBER',
]
/**
 * Validates affiliations should contain combination of allowed values in any order.
 *
 * @param {string} value affiliation current value
 * @param {*} helpers object to construct custom error
 *
 * @returns {string} valiadtion error or value unchanged
 */
const validateAffiliations = (value, helpers) => {
  const values = value.split(',')
  if (values.some(e => !affiliationsAllowedValues.includes(e))) {
    return helpers.error('any.invalid')
  }
  return value
}

const queryParamSchema = Joi.object({
  affiliations: Joi.string().default('OWNER').custom(validateAffiliations),
}).required()

export default class GithubTotalStarService extends GithubAuthV4Service {
  static defaultLabel = 'stars'
  static category = 'social'

  static route = {
    base: 'github/stars',
    pattern: ':user',
    queryParamSchema,
  }

  static openApi = {
    '/github/stars/{user}': {
      get: {
        summary: "GitHub User's stars",
        description,
        parameters: [
          pathParam({ name: 'user', example: 'chris48s' }),
          queryParam({
            name: 'affiliations',
            example: 'OWNER,COLLABORATOR',
            description: affiliationsDescription,
          }),
        ],
      },
    },
    '/github/stars/{org}': {
      get: {
        summary: "GitHub Org's stars",
        description,
        parameters: [pathParam({ name: 'org', example: 'badges' })],
      },
    },
  }

  static defaultBadgeData = {
    label: this.defaultLabel,
    namedLogo: 'github',
  }

  static render({ totalStars, user }) {
    return {
      message: metric(totalStars),
      style: 'social',
      color: 'blue',
      link: [`https://github.com/${user}`],
    }
  }

  async fetch({ user, affiliations, nextCursor }) {
    const variables = { user, affiliations, nextCursor }
    return await this._requestGraphql({
      query,
      variables,
      schema,
      transformJson: json =>
        json.data.organization || json.data.user ? { data: json.data } : json,
      transformErrors: e => transformErrors(e, 'user/org'),
    })
  }

  transform(repos) {
    const totalStars = repos
      .map(element => element.stargazers.totalCount)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    const lastRepo = repos.slice(-1).pop() // undefined when repos is empty
    const hasStars = lastRepo ? lastRepo.stargazers.totalCount !== 0 : false
    return {
      totalStars,
      hasStars,
    }
  }

  async getTotalStars({ user }, { affiliations }) {
    let grandTotalStars = 0
    let fetchedReposCount = 0
    let nextCursor = null
    let hasNext

    do {
      const { data } = await this.fetch({
        user,
        affiliations: affiliations.split(','),
        nextCursor,
      })
      const {
        repositories: {
          pageInfo: { hasNextPage, endCursor },
          nodes: repos,
        },
      } = data.user || data.organization
      const { totalStars, hasStars } = this.transform(repos)
      // repos are sorted based on the stars. If last repo has zero star,
      // no need to fire additional fetch call, as repos on next page will have zero stars only.
      hasNext = hasNextPage && hasStars
      nextCursor = endCursor
      grandTotalStars += totalStars
      fetchedReposCount += repos.length
    } while (hasNext && fetchedReposCount < MAX_REPO_LIMIT)

    return grandTotalStars
  }

  async handle({ user }, queryParams) {
    const totalStars = await this.getTotalStars({ user }, queryParams)
    return this.constructor.render({ totalStars, user })
  }
}
