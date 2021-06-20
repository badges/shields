import Joi from 'joi'
import { starRating } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { BaseXmlService } from '../index.js'

const schema = Joi.object({
  'redmine-plugin': Joi.object({
    'ratings-average': Joi.number().min(0).required(),
  }).required(),
})

class BaseRedminePluginRating extends BaseXmlService {
  static category = 'rating'

  static render({ rating }) {
    throw new Error(`render() function not implemented for ${this.name}`)
  }

  async fetch({ plugin }) {
    const url = `https://www.redmine.org/plugins/${plugin}.xml`
    return this._requestXml({ schema, url })
  }

  async handle({ plugin }) {
    const data = await this.fetch({ plugin })
    const rating = data['redmine-plugin']['ratings-average']
    return this.constructor.render({ rating })
  }
}

class RedminePluginRating extends BaseRedminePluginRating {
  static route = {
    base: 'redmine/plugin/rating',
    pattern: ':plugin',
  }

  static examples = [
    {
      title: 'Plugin on redmine.org',
      namedParams: { plugin: 'redmine_xlsx_format_issue_exporter' },
      staticPreview: this.render({ rating: 5 }),
    },
  ]

  static defaultBadgeData = { label: 'redmine' }

  static render({ rating }) {
    return {
      label: 'rating',
      message: `${rating.toFixed(1)}/5.0`,
      color: floorCountColor(rating, 2, 3, 4),
    }
  }
}

class RedminePluginStars extends BaseRedminePluginRating {
  static route = {
    base: 'redmine/plugin/stars',
    pattern: ':plugin',
  }

  static examples = [
    {
      title: 'Plugin on redmine.org',
      namedParams: { plugin: 'redmine_xlsx_format_issue_exporter' },
      staticPreview: this.render({ rating: 5 }),
    },
  ]

  static render({ rating }) {
    return {
      label: 'stars',
      message: starRating(Math.round(rating)),
      color: floorCountColor(rating, 2, 3, 4),
    }
  }
}

export { RedminePluginRating, RedminePluginStars }
