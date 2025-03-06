import Joi from 'joi'
import { BaseService, NotFound, queryParams } from '../index.js'
import { url } from '../validators.js'
import { renderDynamicBadge } from '../dynamic-common.js'

export default class DynamicRegexService extends BaseService {
  static category = 'dynamic'
  static route = {
    base: `badge/dynamic/regex`,
    pattern: '',
    queryParamSchema: Joi.object({
      url,
      search: Joi.string().required(),
      replace: Joi.string().optional(),
      flags: Joi.string().optional(),
    }),
  }
  static openApi = {
    '/badge/dynamic/regex': {
      get: {
        summary: 'Dynamic Regex Badge',
        description:
          'This badge will search text from a file using regex. Only the first matched text will be returned',
        parameters: queryParams(
          {
            name: 'url',
            description: 'The URL to a file to search',
            required: true,
            example:
              'https://raw.githubusercontent.com/badges/shields/refs/heads/master/README.md',
          },
          {
            name: 'search',
            description:
              'A regex expression that will be used to extract data from the document',
            required: true,
            example: 'Every month it serves (.*?) images',
          },
          {
            name: 'replace',
            description:
              'A regex expression that will be used as the replacement of the search regex. If empty no replacement will be done (the matched regex text will be fully shown)',
            required: false,
            example: '$1',
          },
          {
            name: 'flags',
            description: 'Flags to be used when creating the regex',
            required: false,
            example: 'g',
          },
        ),
      },
    },
  }
  static defaultBadgeData = { label: 'match' }

  async handle(namedParams, { url, search, replace, flags }) {
    const { buffer } = await this._request({ url })

    const searchRegex = RegExp(search, flags)
    const found = searchRegex.exec(buffer)

    if (found == null) {
      throw new NotFound({
        prettyMessage: 'Regex did not match',
      })
    }

    return renderDynamicBadge({
      value: replace ? found[0].replace(searchRegex, replace) : found[0],
    })
  }
}
