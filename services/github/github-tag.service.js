import gql from 'graphql-tag'
import Joi from 'joi'
import { matcher } from 'matcher'
import { latest, renderVersionBadge } from '../version.js'
import { NotFound, redirector, pathParam } from '../index.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import {
  queryParamSchema,
  openApiQueryParams,
} from './github-common-release.js'
import { documentation, transformErrors } from './github-helpers.js'

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      refs: Joi.object({
        edges: Joi.array()
          .items({
            node: Joi.object({
              name: Joi.string().required(),
              target: Joi.object({
                oid: Joi.string().required(),
              }).required(),
            }).required(),
          })
          .required(),
      }).required(),
      submodules: Joi.object({
        nodes: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              subprojectCommitOid: Joi.string().required(),
            }),
          )
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

  static openApi = {
    '/github/v/tag/{user}/{repo}': {
      get: {
        summary: 'GitHub Tag',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'expressjs' }),
          pathParam({ name: 'repo', example: 'express' }),
          ...openApiQueryParams,
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'tag',
  }

  static getLimit({ sort, filter }) {
    if (!filter && sort === 'date') {
      return 1
    }
    return 100
  }

  static applyFilter({ tags, filter }) {
    if (!filter) {
      return tags
    }
    return matcher(tags, filter)
  }

  async fetch({ user, repo, limit }) {
    return this._requestGraphql({
      query: gql`
        query ($user: String!, $repo: String!, $limit: Int!) {
          repository(owner: $user, name: $repo) {
            refs(
              refPrefix: "refs/tags/"
              first: $limit
              orderBy: { field: TAG_COMMIT_DATE, direction: DESC }
            ) {
              edges {
                node {
                  name
                  target {
                    oid
                  }
                }
              }
            }
            submodules(first: 100) {
              nodes {
                name
                subprojectCommitOid
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
    const filter = queryParams.filter
    const limit = this.constructor.getLimit({ sort, filter })

    const json = await this.fetch({ user, repo, limit })
    const tags = this.constructor.applyFilter({
      tags: json.data.repository.refs.edges.map(edge => edge.node.name),
      filter,
    })
    if (tags.length === 0) {
      const prettyMessage = filter ? 'no matching tags found' : 'no tags found'
      throw new NotFound({ prettyMessage })
    }

    const latestTag = this.constructor.getLatestTag({
      tags,
      sort,
      includePrereleases,
    })

    // Get the commit hash for the latest tag
    const latestTagEdge = json.data.repository.refs.edges.find(
      edge => edge.node.name === latestTag,
    )
    const latestTagCommit = latestTagEdge.node.target.oid

    // Check if any submodules are at a different commit than the tag
    const submodules = json.data.repository.submodules.nodes
    const outdatedSubmodules = submodules.filter(
      submodule => submodule.subprojectCommitOid !== latestTagCommit,
    )

    if (outdatedSubmodules.length > 0) {
      return renderVersionBadge({
        version: `${latestTag} (${outdatedSubmodules.length} submodule${
          outdatedSubmodules.length === 1 ? '' : 's'
        } outdated)`,
      })
    }

    return renderVersionBadge({ version: latestTag })
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
