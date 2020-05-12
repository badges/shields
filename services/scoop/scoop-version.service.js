'use strict'

const Joi = require('@hapi/joi')
const { NotFound } = require('..')
const {
  ConditionalGithubAuthV3Service,
} = require('../github/github-auth-service')
const { fetchJsonFromRepo } = require('../github/github-common-fetch')
const { renderVersionBadge } = require('../version')

const gitHubRepoRegExp = new RegExp(
  'https://github.com/(?<user>.*)/(?<repo>.*)/?'
)
const bucketsSchema = Joi.object()
  .pattern(/.+/, Joi.string().pattern(gitHubRepoRegExp).required())
  .required()
const scoopSchema = Joi.object({
  version: Joi.string().required(),
}).required()
const queryParamSchema = Joi.object({
  bucket: Joi.string(),
})

module.exports = class ScoopVersion extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'scoop/v',
      pattern: ':app',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Scoop Version',
        namedParams: { app: 'ngrok' },
        staticPreview: this.render({ version: '2.3.35' }),
      },
      {
        title: 'Scoop Version (extras bucket)',
        namedParams: { app: 'dnspy' },
        queryParams: { bucket: 'extras' },
        staticPreview: this.render({ version: '6.1.4' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'scoop' }
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ app }, queryParams) {
    const buckets = await fetchJsonFromRepo(this, {
      schema: bucketsSchema,
      user: 'lukesampson',
      repo: 'scoop',
      branch: 'master',
      filename: 'buckets.json',
    })
    const bucket = queryParams.bucket || 'main'
    const bucketUrl = buckets[bucket]
    if (!bucketUrl) {
      throw new NotFound({ prettyMessage: `bucket "${bucket}" not found` })
    }
    const {
      groups: { user, repo },
    } = gitHubRepoRegExp.exec(bucketUrl)
    try {
      const { version } = await fetchJsonFromRepo(this, {
        schema: scoopSchema,
        user,
        repo,
        branch: 'master',
        filename: `bucket/${app}.json`,
      })
      return this.constructor.render({ version })
    } catch (error) {
      if (error instanceof NotFound) {
        throw new NotFound({
          prettyMessage: `${app} not found in bucket "${bucket}"`,
        })
      }
      throw error
    }
  }
}
