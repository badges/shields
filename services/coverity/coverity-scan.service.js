import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const messageRegex = /passed|passed .* new defects|pending|failed/
const schema = Joi.object({
  message: Joi.string().regex(messageRegex).required(),
}).required()

export default class CoverityScan extends BaseJsonService {
  static category = 'analysis'
  static route = { base: 'coverity/scan', pattern: ':projectId' }

  static examples = [
    {
      title: 'Coverity Scan',
      namedParams: {
        projectId: '3997',
      },
      staticPreview: this.render({
        message: 'passed',
      }),
    },
  ]

  static defaultBadgeData = { label: 'coverity' }

  static render({ message }) {
    let color
    if (message === 'passed') {
      color = 'brightgreen'
      message = 'passing'
    } else if (/^passed .* new defects$/.test(message)) {
      color = 'yellow'
    } else if (message === 'pending') {
      color = 'orange'
    } else {
      color = 'red'
    }

    return {
      message,
      color,
    }
  }

  async handle({ projectId }) {
    const url = `https://scan.coverity.com/projects/${projectId}/badge.json`
    const json = await this._requestJson({
      url,
      schema,
      errorMessages: {
        // At the moment Coverity returns an HTTP 200 with an HTML page
        // displaying the text 404 when project is not found.
        404: 'project not found',
      },
    })
    return this.constructor.render({ message: json.message })
  }
}
