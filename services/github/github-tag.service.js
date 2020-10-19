'use strict'

const gql = require('graphql-tag')
const Joi = require('joi')
const { addv } = require('../text-formatters')
const { version: versionColor } = require('../color-formatters')
const { latest } = require('../version')
const { NotFound, redirector } = require('..')
const { GithubAuthV4Service } = require('./github-auth-service')
const { queryParamSchema } = require('./github-common-release')
const { documentation, transformErrors } = require('./github-helpers')

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

  async fetch({ user, repo, sort }) {
    const limit = sort === 'semver' ? 100 : 1
    return this._requestGraphql({
      query: gql`
        query($user: String!, $repo: String!, $limit: Int!) {
          repository(owner: $user, name: $repo) {
            refs(
              refPrefix: "refs/tags/"
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
      variables: { user, repo, limit },
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

    const json = await this.fetch({ user, repo, sort })
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

module.exports = {
  GithubTag,
  ...redirects,
}
