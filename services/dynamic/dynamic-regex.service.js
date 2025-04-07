import Joi from 'joi'
import RE2 from 're2'
import {
  BaseService,
  InvalidParameter,
  InvalidResponse,
  queryParams,
} from '../index.js'
import { url } from '../validators.js'
import { httpErrors, renderDynamicBadge } from '../dynamic-common.js'

const VALID_FLAGS = 'imsU-'

export default class DynamicRegex extends BaseService {
  static category = 'dynamic'
  static route = {
    base: `badge/dynamic/regex`,
    pattern: '',
    queryParamSchema: Joi.object({
      url,
      search: Joi.string().required(),
      replace: Joi.string().optional(),
      flags: Joi.string().optional(),
      noMatch: Joi.string().optional(),
    }),
  }
  static openApi = {
    '/badge/dynamic/regex': {
      get: {
        summary: 'Dynamic Regex (re2) Badge [Experimental]',
        description:
          '⚠️ Experimental: This badge is considered experimental and may change or be removed at any time.\n\nThis badge will extract text from a file using re2 (a subset of regex: https://github.com/google/re2).\nThe main use-case is to extract values from unsupported plain-text files.\nFor example: if a file contains a line like `version - 2.4` you can extract the value `2.4` by using a search regex of `version - (.*)` and `$1` as replacement.\n\nFull Syntax documentation here: https://github.com/google/re2/wiki/Syntax',
        parameters: queryParams(
          {
            name: 'url',
            description:
              'The URL to a file to search. The full raw content will be used as the search string.',
            required: true,
            example:
              'https://raw.githubusercontent.com/badges/shields/refs/heads/master/README.md',
          },
          {
            name: 'search',
            description:
              'A re2 expression that will be used to extract data from the document. Only the first matched text will be returned.',
            required: true,
            example: 'Every month it serves (.*?) images',
          },
          {
            name: 'replace',
            description:
              'A regex expression that will be used as the replacement of the search regex, like `$1` to specify the first matched group, etc. If empty (default), no replacement will be done and the full matched text will be shown.',
            required: false,
            example: '$1',
          },
          {
            name: 'flags',
            description:
              'Flags to be used when creating the regex: `i` = case-insensitive, `m` = multi-line mode, `s` = dot matches linebreaks, `U` = ungreedy. None by default.',
            required: false,
            example: 'imsU',
          },
        ),
      },
    },
  }
  static defaultBadgeData = { label: 'match' }

  async handle(namedParams, { url, search, replace, flags }) {
    // fetch file
    const { buffer } = await this._request({ url, logErrors: [], httpErrors })

    // validate flags
    if (flags?.split('')?.some(c => VALID_FLAGS.indexOf(c) === -1)) {
      throw new InvalidParameter({
        prettyMessage: `Invalid flags, must be one of: ${VALID_FLAGS}`,
      })
    }

    // build re2 regex
    let re2
    try {
      re2 = new RE2(search, flags)
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new InvalidParameter({
          prettyMessage: `Invalid re2 regex: ${error.message}`,
        })
      }
      throw error
    }

    // extract value
    const found = re2.exec(buffer)

    if (found == null) {
      // not found
      throw new InvalidResponse({
        prettyMessage: 'no result',
      })
    }

    // replace if needed
    return renderDynamicBadge({
      value: replace === undefined ? found[0] : found[0].replace(re2, replace),
    })
  }
}
