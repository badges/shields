import Joi from 'joi'
import { url } from '../validators.js'
import { BaseService, InvalidResponse, queryParam } from '../index.js'

const description = `
OSS Lifecycle is an initiative started by Netflix to classify open-source projects into lifecycles
and clearly identify which projects are active and which ones are retired. To enable this badge,
simply create an OSSMETADATA tagging file at the root of your repository containing a
single line similar to the following: \`osslifecycle=active\`. Other suggested values are
\`osslifecycle=maintenance\` and \`osslifecycle=archived\`. A working example
can be viewed on the [OSS Tracker repository](https://github.com/Netflix/osstracker).
`

const queryParamSchema = Joi.object({
  file_url: url,
}).required()

export default class OssTracker extends BaseService {
  static category = 'other'

  static route = {
    base: '',
    pattern: 'osslifecycle',
    queryParamSchema,
  }

  static openApi = {
    '/osslifecycle': {
      get: {
        summary: 'OSS Lifecycle',
        description,
        parameters: [
          queryParam({
            name: 'file_url',
            example:
              'https://raw.githubusercontent.com/Netflix/aws-autoscaling/master/OSSMETADATA',
            required: true,
            description: 'URL for the `OSSMETADATA` file',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'oss lifecycle' }

  /**
   * Return color for active, maintenance and archived statuses, which were the three
   * example keywords used in Netflix's open-source meetup.
   * See https://slideshare.net/aspyker/netflix-open-source-meetup-season-4-episode-1
   * Other keywords are possible, but will appear in grey.
   *
   * @param {object} attrs Refer to individual attrs
   * @param {string} attrs.status Specifies the current maintenance status
   * @returns {string} color
   */
  static getColor({ status }) {
    if (status === 'active') {
      return 'brightgreen'
    } else if (status === 'maintenance') {
      return 'yellow'
    } else if (status === 'archived') {
      return 'red'
    }
    return 'lightgrey'
  }

  static render({ status }) {
    const color = this.getColor({ status })
    return {
      message: status,
      color,
    }
  }

  async fetch({ fileUrl }) {
    return this._request({
      url: fileUrl,
    })
  }

  async handle(pathParams, { file_url: fileUrl = '' }) {
    const { buffer } = await this.fetch({
      fileUrl,
    })
    try {
      const status = buffer.match(/osslifecycle=([a-z]+)/im)[1]
      return this.constructor.render({ status })
    } catch (e) {
      throw new InvalidResponse({
        prettyMessage: 'metadata in unexpected format',
      })
    }
  }
}
