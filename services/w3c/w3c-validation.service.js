'use strict'
const url = require('url')
const Joi = require('@hapi/joi')
const { optionalUrl } = require('../validators')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  url: optionalUrl.required(),
  messages: Joi.array()
    .required()
    .items(Joi.object()),
}).required()

const html5Expression =
  '^HTML\\s?,\\s?SVG\\s?1\\.1\\s?,\\s?MathML\\s?3\\.0(\\s?,\\s?((ITS\\s?2\\.0)|(RDFa\\s?Lite\\s?1\\.1)))?$'

const html4Expression =
  '^HTML\\s?4\\.01\\s?(Strict|Transitional|Frameset)\\s?,\\s?URL\\s?\\/\\s?XHTML\\s?1\\.0\\s?(Strict|Transitional|Frameset)\\s?,\\s?URL$'
const xhtmlExpression =
  '^(XHTML\\s?,\\s?SVG\\s?1\\.1\\s?,\\s?MathML\\s?3\\.0(\\s?,\\s?RDFa\\s?Lite\\s?1\\.1)?)|(XHTML\\s?1\\.0\\s?Strict\\s?,\\s?URL\\s?,\\s?Ruby\\s?,\\s?SVG\\s?1\\.1\\s?,\\s?MathML\\s?3\\.0)$'
const svgExpression =
  '^SVG\\s?1\\.1\\s?,\\s?URL\\s?,\\s?XHTML\\s?,\\s?MathML\\s?3\\.0$'
const presetRegex = new RegExp(
  `(${html5Expression})|(${html4Expression})|(${xhtmlExpression})|(${svgExpression})`,
  'i'
)
const parserRegex = new RegExp(`(^html$)|(^xml$)|(^xmldtd$)`, 'i')
const queryParamDecode = regExpression => (value, helpers) => {
  if (!value) {
    return ''
  }

  if (regExpression && !decodeURI(value).match(regExpression)) {
    return helpers.error('regex')
  }

  // Return the value unchanged
  return value
}

const queryParamSchema = Joi.object({
  doc: optionalUrl.required(),
  preset: Joi.string()
    .allow('')
    .custom(queryParamDecode(presetRegex), 'preset validation'),
  parser: Joi.string()
    .allow('')
    .custom(queryParamDecode(parserRegex), 'parser validation'),
}).required()

const documentation = `
  <style>
    .box {
      display: flex;
      justify-content: space-between;
    }
    .note {
      font-size: smaller;
      text-align: left;
    }
  </style>
  <p>
    The W3C validation badge performs validation of the HTML, SVG, MathML, ITS, RDFa Lite, XHTML documents.
    The badge uses the type property of each message found in the messages from the validation results to determine to be an error or warning.
    The rules are as follows:
    <ul class="note">
      <li>info:  These messages are counted as warnings</li>
      <li>error:  These messages are counted as errors</li>
      <li>non-document-error: These messages are counted as errors</li>
    </ul>
  </p>
  <p>
    This badge relies on the https://validator.nu service to perform the validation. Please refer to https://about.validator.nu/ for the full documentation and Terms of service.
    For the badge to function it requires the consumer to promote the following parameters:
    <ul class="note">
      <li>
        doc (Required): This is the path for the document to be validated
      </li>
      <li>
        preset (Optional can be left as blank): This is used to determine the schema for the document to be valdiated against.
        The following are the allowed values
        <ul>
          <li>HTML, SVG 1.1, MathML 3.0</li>
          <li>HTML, SVG 1.1, MathML 3.0, ITS 2.0</li>
          <li>HTML, SVG 1.1, MathML 3.0, RDFa Lite 1.1</li>
          <li>HTML 4.01 Strict, URL / XHTML 1.0 Strict, URL</li>
          <li>HTML 4.01 Transitional, URL / XHTML 1.0 Transitional, URL</li>
          <li>HTML 4.01 Frameset, URL / XHTML 1.0 Frameset, URL</li>
          <li>XHTML, SVG 1.1, MathML 3.0</li>
          <li>XHTML, SVG 1.1, MathML 3.0, RDFa Lite 1.1</li>
          <li>XHTML 1.0 Strict, URL, Ruby, SVG 1.1, MathML 3.0</li>
          <li>SVG 1.1, URL, XHTML, MathML 3.0</li>        
        </ul>
      </li>    
      <li>
        parser (Optional can be left as blank): The parser that is used for validation. This is a passthru value to the service
        <ul>
          <li>html <i>(HTML)</i></li>
          <li>xml <i>(XML; don’t load external entities)</i></li>
          <li>xmldtd <i>(XML; load external entities)</i></li>
        </ul>
      </li>  
    </ul>
  </p>
`

module.exports = class W3cValidation extends BaseJsonService {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'w3c-validation',
      pattern: 'doc',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'W3C Validation',
        namedParams: {},
        queryParams: {
          doc: 'https://shields.io',
          preset: 'HTML, SVG 1.1, MathML 3.0',
          parser: 'html',
        },
        staticPreview: this.render({
          message: 'validated',
          color: 'brightgreen',
        }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      namedLogo: 'w3c',
    }
  }

  static render({ message, color }) {
    return {
      label: 'w3c',
      message,
      color,
    }
  }

  getSchema(preset) {
    const schema = []
    const decodedPreset = decodeURI(preset)
    if (decodedPreset.match(new RegExp(html4Expression, 'i'))) {
      if (decodedPreset.match(/Strict/i)) {
        schema.push('http://s.validator.nu/xhtml10/xhtml-strict.rnc')
      } else if (decodedPreset.match(/Transitional/i)) {
        schema.push('http://s.validator.nu/xhtml10/xhtml-transitional.rnc')
      } else {
        schema.push('http://s.validator.nu/xhtml10/xhtml-frameset.rnc')
      }
      schema.push('http://s.validator.nu/html4/assertions.sch')
      schema.push('http://c.validator.nu/all-html4/')
    } else {
      if (decodedPreset.match(new RegExp(html5Expression, 'i'))) {
        if (decodedPreset.match(/ITS 2\.0/i)) {
          schema.push('http://s.validator.nu/html5-its.rnc')
        } else if (decodedPreset.match(/RDFa Lite 1\.1/i)) {
          schema.push('http://s.validator.nu/html5-rdfalite.rnc')
        } else {
          schema.push('http://s.validator.nu/html5.rnc')
        }
      } else if (decodedPreset.match(new RegExp(xhtmlExpression, 'i'))) {
        if (decodedPreset.match(/RDFa Lite 1\.1/i)) {
          schema.push('http://s.validator.nu/xhtml1-ruby-rdf-svg-mathml.rnc')
        } else if (decodedPreset.match(/1\.0 Strict, URL, Ruby, SVG 1\.1/i)) {
          schema.push('http://s.validator.nu/xhtml1-ruby-rdf-svg-mathml.rnc')
        } else {
          schema.push('http://s.validator.nu/xhtml5.rnc')
        }
      } else if (decodedPreset.match(new RegExp(svgExpression, 'i'))) {
        schema.push('http://s.validator.nu/svg-xhtml5-rdf-mathml.rnc')
      }
      schema.push('http://s.validator.nu/html5/assertions.sch')
      schema.push('http://c.validator.nu/all/')
    }
    return schema.join(' ')
  }

  getMessage(messageTypes) {
    const messageTypeKeys = Object.keys(messageTypes)
    messageTypeKeys.sort() // Sort to make the order error, warning for display

    if (Object.keys(messageTypes).length === 0) {
      return 'validated'
    }

    const messages = messageTypeKeys.map(
      key => `${messageTypes[key]} ${key}${messageTypes[key] > 1 ? 's' : ''}`
    )
    return messages.join(', ')
  }

  getColor(messageTypes) {
    if ('error' in messageTypes) {
      return 'red'
    }

    if ('warning' in messageTypes) {
      return 'yellow'
    }

    return 'brightgreen'
  }

  getUrl(doc, preset, parser) {
    const qs = { doc, out: 'json' }
    if (preset) qs['schema'] = this.getSchema(preset)
    if (parser) qs['parser'] = parser
    return {
      url: 'http://validator.nu',
      schema,
      options: {
        qs,
      },
    }
  }

  async fetch(jsonUrl) {
    return this._requestJson(jsonUrl)
  }

  async handle(_routeParams, { doc, preset, parser }) {
    const jsonUrl = this.getUrl(doc, preset, parser)
    const data = await this.fetch(jsonUrl)
    const reducer = (accumulator, message) => {
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
    }
    const messageTypes = data.messages.reduce(reducer, {})
    const badge = this.constructor.render({
      message: this.getMessage(messageTypes),
      color: this.getColor(messageTypes),
    })
    badge.link = [
      url
        .format({
          host: jsonUrl.url,
          query: jsonUrl.options.qs,
        })
        .toString(),
    ]
    return badge
  }
}
