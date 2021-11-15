import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { BaseJsonService, NotFound } from '../index.js'
import {
  documentation,
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
      })
    ),
}).required()

const queryParamSchema = Joi.object({
  targetUrl: optionalUrl.required(),
  preset: Joi.string().regex(presetRegex).allow(''),
}).required()

export default class W3cValidation extends BaseJsonService {
  static category = 'analysis'

  static route = {
    base: 'w3c-validation',
    pattern: ':parser(default|html|xml|xmldtd)',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'W3C Validation',
      namedParams: { parser: 'html' },
      queryParams: {
        targetUrl: 'https://validator.nu/',
        preset: 'HTML, SVG 1.1, MathML 3.0',
      },
      staticPreview: this.render({ messageTypes: {} }),
      documentation,
    },
  ]

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
