import gql from 'graphql-tag'
import Joi from 'joi'
import { addv } from '../text-formatters.js'
import { version as versionColor } from '../color-formatters.js'
import { latest } from '../version.js'
import { NotFound, redirector } from '../index.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { queryParamSchema } from './github-common-release.js'
import { documentation, transformErrors } from './github-helpers.js'

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      refs: Joi.object({
        edges: Joi.array()
          .items({
            node: Joi.object({
              name: Joi.string().required(),
            }).required(),
          })
          .required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

class GithubTag extends GithubAuthV4Service {
  static category = 'version'

  static route = {
    base: 'github/v/tag',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub tag (latest by date)',
      namedParams: { user: 'expressjs', repo: 'express' },
      staticPreview: this.render({
        version: 'v5.0.0-alpha.7',
        sort: 'date',
      }),
      documentation,
    },
    {
      title: 'GitHub tag (latest SemVer)',
      namedParams: { user: 'expressjs', repo: 'express' },
      queryParams: { sort: 'semver' },
      staticPreview: this.render({ version: 'v4.16.4', sort: 'semver' }),
      documentation,
    },
    {
      title: 'GitHub tag (latest SemVer pre-release)',
      namedParams: { user: 'expressjs', repo: 'express' },
      queryParams: { sort: 'semver', include_prereleases: null },
      staticPreview: this.render({
        version: 'v5.0.0-alpha.7',
        sort: 'semver',
      }),
      documentation,
    },
    {
      title: 'GitHub tag (latest filter by prefix)',
      namedParams: { user: 'ros', repo: 'rosdistro' },
      queryParams: { prefix: 'galactic' },
      staticPreview: this.render({
        version: '2022-06-24',
      }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'tag',
  }

  static render({ version, sort }) {
    return {
      message: addv(version),
      color: sort === 'semver' ? versionColor(version) : 'blue',
    }
  }

  async fetch({ user, repo, sort, prefix }) {
    const limit = sort === 'semver' ? 100 : 1

    let refPrefix = 'refs/tags/'
    if (prefix) {
      if (!prefix.endsWith('/')) prefix += '/'
      refPrefix += prefix
    }

    return this._requestGraphql({
      query: gql`
        query (
          $user: String!
          $repo: String!
          $limit: Int!
          $refPrefix: String!
        ) {
          repository(owner: $user, name: $repo) {
            refs(
              refPrefix: $refPrefix
              first: $limit
              orderBy: { field: TAG_COMMIT_DATE, direction: DESC }
            ) {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      `,
      variables: { user, repo, limit, refPrefix },
      schema,
      transformErrors,
    })
  }

  static getLatestTag({ tags, sort, includePrereleases }) {
    if (sort === 'semver') {
      return latest(tags, { pre: includePrereleases })
    }
    return tags[0]
  }

  async handle({ user, repo }, queryParams) {
    const sort = queryParams.sort
    const includePrereleases = queryParams.include_prereleases !== undefined
    const prefix = queryParams.prefix

    const json = await this.fetch({ user, repo, sort, prefix })
    const tags = json.data.repository.refs.edges.map(edge => edge.node.name)
    if (tags.length === 0) {
      throw new NotFound({ prettyMessage: 'no tags found' })
    }
    return this.constructor.render({
      version: this.constructor.getLatestTag({
        tags,
        sort,
        includePrereleases,
      }),
      sort,
    })
  }
}

const redirects = {
  GithubTagRedirect: redirector({
    category: 'version',
    route: {
      base: 'github/tag',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) => `/github/v/tag/${user}/${repo}`,
    transformQueryParams: params => ({ sort: 'semver' }),
    dateAdded: new Date('2019-08-17'),
  }),
  GithubTagPreRedirect: redirector({
    category: 'version',
    route: {
      base: 'github/tag-pre',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) => `/github/v/tag/${user}/${repo}`,
    transformQueryParams: params => ({
      sort: 'semver',
      include_prereleases: null,
    }),
    dateAdded: new Date('2019-08-17'),
  }),
  GithubTagDateRedirect: redirector({
    category: 'version',
    route: {
      base: 'github/tag-date',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) => `/github/v/tag/${user}/${repo}`,
    dateAdded: new Date('2019-08-17'),
  }),
}

export { GithubTag, redirects }
