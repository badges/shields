'use strict'

const Joi = require('@hapi/joi')
const { NotFound, redirector } = require('..')
const { addv } = require('../text-formatters')
const { version: versionColor } = require('../color-formatters')
const { latest } = require('../version')
const { GithubAuthService } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const queryParamSchema = Joi.object({
  include_prereleases: Joi.equal(''),
  sort: Joi.string()
    .valid('date', 'semver')
    .default('date'),
}).required()

const schema = Joi.alternatives()
  .try(
    Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
        })
      )
      .required(),
    Joi.array().length(0)
  )
  .required()

class GithubTag extends GithubAuthService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github/v/tag',
      pattern: ':user/:repo',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
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
  }

  static get defaultBadgeData() {
    return { label: 'tag' }
  }

  static render({ version, sort }) {
    return {
      message: addv(version),
      color: sort === 'semver' ? versionColor(version) : 'blue',
    }
  }

  async fetch({ user, repo }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/tags`,
      schema,
      errorMessages: errorMessagesFor('repo not found'),
    })
  }

  static getLatestTag({ tags, sort, includePrereleases }) {
    if (sort === 'semver') {
      return latest(tags.map(tag => tag.name), { pre: includePrereleases })
    }
    return tags[0].name
  }

  async handle({ user, repo }, queryParams) {
    const sort = queryParams.sort
    const includePrereleases = queryParams.include_prereleases !== undefined

    const tags = await this.fetch({ user, repo })
    if (tags.length === 0) throw new NotFound({ prettyMessage: 'none' })
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
    dateAdded: new Date('2019-06-25'),
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
    dateAdded: new Date('2019-06-25'),
  }),
  GithubTagDateRedirect: redirector({
    category: 'version',
    route: {
      base: 'github/tag-date',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) => `/github/v/tag/${user}/${repo}`,
    dateAdded: new Date('2019-06-25'),
  }),
}

module.exports = {
  GithubTag,
  ...redirects,
}
