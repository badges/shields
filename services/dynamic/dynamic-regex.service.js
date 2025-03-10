import { createContext, Script } from 'node:vm'
import Joi from 'joi'
import {
  BaseService,
  InvalidParameter,
  NotFound,
  queryParams,
} from '../index.js'
import { url } from '../validators.js'
import { renderDynamicBadge } from '../dynamic-common.js'

const SCRIPT = new Script(`
    let found = searchRegex.exec(string)

    found == null ? null
    : replace == null ? found[0]
    : found[0].replace(searchRegex, replace)
`)

const TIMEOUT = 1000

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
              'A regex expression that will be used to extract data from the document, using javascript specification. Documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions',
            required: true,
            example: 'Every month it serves (.*?) images',
          },
          {
            name: 'replace',
            description:
              'A regex expression that will be used as the replacement of the search regex. If empty no replacement will be done (the matched regex text will be fully shown). You can use $n to specify matched groups, among others. Documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_the_replacement',
            required: false,
            example: '$1',
          },
          {
            name: 'flags',
            description:
              'Flags to be used when creating the regex, like `i` for case insensitive, or `m` for multiline. Documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#advanced_searching_with_flags',
            required: false,
            example: 'g',
          },
        ),
      },
    },
  }
  static defaultBadgeData = { label: 'match' }

  async handle(namedParams, { url, search, replace, flags }) {
    // fetch file
    const { buffer } = await this._request({ url })

    // exec the regex inside a vm to be able to set a timeout
    // this will prevent a ReDoS attack (https://en.wikipedia.org/wiki/ReDoS)
    let value
    try {
      value = SCRIPT.runInContext(
        createContext({
          string: buffer,
          searchRegex: RegExp(search, flags),
          replace,
        }),
        { timeout: TIMEOUT },
      )
    } catch (ex) {
      throw new InvalidParameter({
        prettyMessage: 'Regex failed to be evaluated',
      })
    }

    if (value == null) {
      throw new NotFound({
        prettyMessage: 'Regex did not match',
      })
    }

    return renderDynamicBadge({ value })
  }
}
