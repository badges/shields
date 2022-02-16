import Joi from 'joi'
import { anyInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  data: Joi.object({
    link_karma: anyInteger,
    comment_karma: anyInteger,
  }).required(),
}).required()

export default class RedditUserKarma extends BaseJsonService {
  static category = 'social'

  static route = {
    base: 'reddit/user-karma',
    pattern: ':variant(link|comment|combined)/:user',
  }

  static examples = [
    {
      title: 'Reddit User Karma',
      namedParams: { variant: 'combined', user: 'example' },
      staticPreview: {
        label: 'combined karma',
        message: 56,
        color: 'brightgreen',
        style: 'social',
      },
    },
  ]

  static defaultBadgeData = {
    label: 'reddit karma',
    namedLogo: 'reddit',
  }

  static render({ variant, karma, user }) {
    const label =
      variant === 'combined'
        ? `u/${user} karma`
        : `u/${user} karma (${variant})`
    return {
      label,
      message: metric(karma),
      color: karma > 0 ? 'brightgreen' : karma === 0 ? 'orange' : 'red',
      link: [`https://www.reddit.com/u/${user}`],
    }
  }

  async fetch({ user }) {
    return this._requestJson({
      schema,
      url: `https://www.reddit.com/u/${user}/about.json`,
      errorMessages: {
        404: 'user not found',
      },
    })
  }

  transform({ json, variant }) {
    let karma
    if (variant === 'link') {
      karma = json.data.link_karma
    } else if (variant === 'comment') {
      karma = json.data.comment_karma
    } else {
      const total = json.data.link_karma + json.data.comment_karma
      karma = total
    }

    return { karma }
  }

  async handle({ variant, user }) {
    const json = await this.fetch({ user })
    const { karma } = this.transform({ json, variant })

    return this.constructor.render({
      variant,
      karma,
      user,
    })
  }
}
