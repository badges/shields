import moment from 'moment'
import Joi from 'joi'
import { age } from '../color-formatters.js'
import { formatDate } from '../text-formatters.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

const schema = Joi.alternatives(
  Joi.object({
    created_at: Joi.date().required(),
  }).required(),
  Joi.array()
    .items(
      Joi.object({
        created_at: Joi.date().required(),
      }).required()
    )
    .min(1)
)

export default class GithubReleaseDate extends GithubAuthV3Service {
  static category = 'activity'
  static route = {
    base: 'github',
    pattern: ':variant(release-date|release-date-pre)/:user/:repo',
  }

  static examples = [
    {
      title: 'GitHub Release Date',
      pattern: 'release-date/:user/:repo',
      namedParams: {
        user: 'SubtitleEdit',
        repo: 'subtitleedit',
      },
      staticPreview: this.render({ date: '2017-04-13T07:50:27.000Z' }),
      documentation,
    },
    {
      title: 'GitHub (Pre-)Release Date',
      pattern: 'release-date-pre/:user/:repo',
      namedParams: {
        user: 'Cockatrice',
        repo: 'Cockatrice',
      },
      staticPreview: this.render({ date: '2017-04-13T07:50:27.000Z' }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'release date' }

  static render({ date }) {
    const releaseDate = moment(date)
    return {
      message: formatDate(releaseDate),
      color: age(releaseDate),
    }
  }

  async fetch({ variant, user, repo }) {
    const url =
      variant === 'release-date'
        ? `/repos/${user}/${repo}/releases/latest`
        : `/repos/${user}/${repo}/releases`
    return this._requestJson({
      url,
      schema,
      errorMessages: errorMessagesFor('no releases or repo not found'),
    })
  }

  async handle({ variant, user, repo }) {
    const body = await this.fetch({ variant, user, repo })
    if (Array.isArray(body)) {
      return this.constructor.render({ date: body[0].created_at })
    }
    return this.constructor.render({ date: body.created_at })
  }
}
