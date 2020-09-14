'use strict'

const Joi = require('@hapi/joi')
const gql = require('graphql-tag')
const { nonNegativeInteger } = require('../validators')
const { metric } = require('../text-formatters')
const { GithubAuthV4Service } = require('./github-auth-service')
const {
  documentation: commonDocumentation,
  transformErrors,
} = require('./github-helpers')

const MAX_REPO_LIMIT = 200

const customDocumentation = `This badge takes upto <code>${MAX_REPO_LIMIT}</code> most starred repositories of given user / org into account.`

const userDocumentation = `${commonDocumentation}
<p>
  <b>Note:</b><br>
  1. ${customDocumentation}<br>
  2. <code>affiliations</code> query param accepts three value <code>OWNER</code>, <code>COLLABORATOR</code>, <code>ORGANIZATION_MEMBER</code>.
  One can pass comma separated combination of these values (no spaces) e.g. <code>OWNER,COLLABORATOR</code> or <code>OWNER,COLLABORATOR,ORGANIZATION_MEMBER</code>.
  Default value is <code>OWNER</code>. See these values explanation <a href="https://docs.github.com/en/graphql/reference/enums#repositoryaffiliation">here</a>.
</p>
`
const orgDocumentation = `${commonDocumentation}
<p>
  <b>Note:</b> ${customDocumentation}
</p>`

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
    })
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
    }).required()
  ).required(),
}).required()

const userQuery = gql`
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
  }
`

const orgQuery = gql`
  query fetchStars($user: String!, $nextCursor: String) {
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
  `COLLABORATOR`,
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
  org: Joi.valid('').optional(),
  affiliations: Joi.string().default('OWNER').custom(validateAffiliations),
}).required()

module.exports = class GithubTotalStarService extends GithubAuthV4Service {
  static get defaultLabel() {
    return 'Stars'
  }

  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'github/stars',
      pattern: ':user',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: "Github User's stars",
        namedParams: {
          user: 'chris48s',
        },
        queryParams: { affiliations: 'OWNER,COLLABORATOR' },
        staticPreview: {
          label: this.defaultLabel,
          message: 54,
          style: 'social',
        },
        documentation: userDocumentation,
      },
      {
        title: "Github Org's stars",
        namedParams: {
          user: 'badges',
        },
        queryParams: { org: null },
        staticPreview: {
          label: this.defaultLabel,
          message: metric(7000),
          style: 'social',
        },
        documentation: orgDocumentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: this.defaultLabel,
      namedLogo: 'github',
    }
  }

  static render({ totalStars, user }) {
    return {
      message: metric(totalStars),
      color: 'blue',
      link: [`https://github.com/${user}`],
    }
  }

  async fetch({ user, org, affiliations, nextCursor }) {
    const query = org === undefined ? userQuery : orgQuery
    const variables = { user, affiliations, nextCursor }
    return await this._requestGraphql({
      query,
      variables,
      schema,
      transformErrors: e =>
        transformErrors(e, org === undefined ? 'user' : 'org'),
    })
  }

  transform(repos) {
    const totalStars = repos
      .map(element => element.stargazers.totalCount)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    return {
      totalStars,
    }
  }

  async getTotalStars({ user }, { org, affiliations }) {
    let grandTotalStars = 0
    let fetchedReposCount = 0
    let nextCursor = null
    let hasNext
    const dataType = org === undefined ? 'user' : 'organization'

    do {
      const { data } = await this.fetch({
        user,
        org,
        affiliations: affiliations.split(','),
        nextCursor,
      })
      const {
        repositories: {
          pageInfo: { hasNextPage, endCursor },
          nodes: repos,
        },
      } = data[dataType]
      hasNext = hasNextPage
      nextCursor = endCursor

      const { totalStars } = this.transform(repos)
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
