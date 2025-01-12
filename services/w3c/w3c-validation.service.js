import Joi from 'joi'
import { url } from '../validators.js'
import { BaseJsonService, NotFound, pathParam, queryParam } from '../index.js'
import {
  description,
  presetRegex,
  getColor,
  getMessage,
  getSchema,
} from './w3c-validation-helper.js'

const schema = Joi.object({
  url: Joi.string().optional(),
  messages: Joi.array()
    .required()
    .items(
      Joi.object({
        type: Joi.string()
          .allow('info', 'error', 'non-document-error')
          .required(),
        subType: Joi.string().optional(),
        message: Joi.string().required(),
      }),
    ),
}).required()

const queryParamSchema = Joi.object({
  targetUrl: url,
  preset: Joi.string().regex(presetRegex).allow(''),
}).required()

const parserDescription = `The parser that is used for validation. This is a passthru value to the service
- \`default\`: This will not pass a parser to the API and make the API choose the parser based on the validated content
- \`html\`: HTML
- \`xml\`: XML (don't load external entities)
- \`xmldtd\`: XML (load external entities)
`

export default class W3cValidation extends BaseJsonService {
  static category = 'analysis'

  static route = {
    base: 'w3c-validation',
    pattern: ':parser(default|html|xml|xmldtd)',
    queryParamSchema,
  }

  static openApi = {
    '/w3c-validation/{parser}': {
      get: {
        summary: 'W3C Validation',
        description,
        parameters: [
          pathParam({
            name: 'parser',
            example: 'html',
            schema: { type: 'string', enum: this.getEnum('parser') },
            description: parserDescription,
          }),
          queryParam({
            name: 'targetUrl',
            example: 'https://validator.nu/',
            required: true,
            description: 'URL of the document to be validate',
          }),
          queryParam({
            name: 'preset',
            example: 'HTML, SVG 1.1, MathML 3.0',
            description:
              'This is used to determine the schema for the document to be valdiated against.',
            schema: {
              type: 'string',
              enum: [
                'HTML, SVG 1.1, MathML 3.0',
                'HTML, SVG 1.1, MathML 3.0, ITS 2.0',
                'HTML, SVG 1.1, MathML 3.0, RDFa Lite 1.1',
                'HTML 4.01 Strict, URL / XHTML 1.0 Strict, URL',
                'HTML 4.01 Transitional, URL / XHTML 1.0 Transitional, URL',
                'HTML 4.01 Frameset, URL / XHTML 1.0 Frameset, URL',
                'XHTML, SVG 1.1, MathML 3.0',
                'XHTML, SVG 1.1, MathML 3.0, RDFa Lite 1.1',
                'XHTML 1.0 Strict, URL, Ruby, SVG 1.1, MathML 3.0',
                'SVG 1.1, URL, XHTML, MathML 3.0',
              ],
            },
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'w3c',
  }

  static render({ messageTypes }) {
    return {
      message: getMessage(messageTypes),
      color: getColor(messageTypes),
    }
  }

  async fetch(targetUrl, preset, parser) {
    return this._requestJson({
      url: 'https://validator.nu/',
      schema,
      options: {
        searchParams: {
          schema: getSchema(preset),
          parser: parser === 'default' ? undefined : parser,
          doc: encodeURI(targetUrl),
          out: 'json',
        },
      },
    })
  }

  transform(url, messages) {
    if (messages.length === 1) {
      const { subType, type, message } = messages[0]
      if (type === 'non-document-error' && subType === 'io') {
        let notFound = false
        if (
          message ===
          'HTTP resource not retrievable. The HTTP status from the remote server was: 404.'
        ) {
          notFound = true
        } else if (message.endsWith('Name or service not known')) {
          const domain = message.split(':')[0].trim()
          notFound = url.indexOf(domain) !== -1
        }

        if (notFound) {
          throw new NotFound({ prettyMessage: 'target url not found' })
        }
      }
    }

    return messages.reduce((accumulator, message) => {
      let { type } = message
      if (type === 'info') {
        type = 'warning'
      } else {
        // All messages are suppose to have a type and there can only be info, error or non-document
        // If a new type gets introduce this will flag them as errors
        type = 'error'
      }

      if (!(type in accumulator)) {
        accumulator[type] = 0
      }
      accumulator[type] += 1
      return accumulator
    }, {})
  }

  async handle({ parser }, { targetUrl, preset }) {
    const { url, messages } = await this.fetch(targetUrl, preset, parser)
    return this.constructor.render({
      messageTypes: this.transform(url, messages),
    })
  }
}
