import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { BaseJsonService } from '../index.js'

const documentation = `
  <div>
    <p>
      You can obtain a user's ID once a <a href="https://www.protondb.com/help/site-questions#why-are-my-reports-not-showing-up-on-game-pages">content refresh</a>
      has occurred after they've filed their first report. This can take a few days.
    </p>
    <p>
      Once the user has a published report, their profile becomes publicly accessible by clicking on the left-side of their reports.
      Profile URLs are formatted like <code>/users/:id</code>, take the ID from here.
    </p>
  </div>
  `

/**
 * Validates that the schema response is what we're expecting.
 */
const schema = Joi.object({
  reports: Joi.array().required(),
}).required()

/**
 * This badge displays the total number of reports someone has submitted
 * to ProtonDB.
 */
export default class ProtonDbPoints extends BaseJsonService {
  static category = 'other'
  static route = {
    base: 'protondb/reports',
    pattern: ':id',
  }

  static examples = [
    {
      title: 'ProtonDB reports',
      namedParams: { id: '938767784' },
      staticPreview: this.render({ reports: 12 }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'reports', color: 'info' }

  static render({ reports }) {
    return { message: metric(reports) }
  }

  async fetch({ id }) {
    return this._requestJson({
      schema,
      url: `https://www.protondb.com/data/users/by_id/${id}.json`,
      errorMessages: {
        404: 'profile not found',
      },
    })
  }

  static transform(response) {
    const { reports } = response
    return reports.length
  }

  async handle({ id }) {
    const response = await this.fetch({ id })
    const reports = this.constructor.transform(response)
    return this.constructor.render({ reports })
  }
}
