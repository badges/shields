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
  'i',
)

const getMessage = messageTypes => {
  const messageTypeKeys = Object.keys(messageTypes)
  messageTypeKeys.sort() // Sort to make the order error, warning for display

  if (messageTypeKeys.length === 0) {
    return 'validated'
  }

  const messages = messageTypeKeys.map(
    key => `${messageTypes[key]} ${key}${messageTypes[key] > 1 ? 's' : ''}`,
  )
  return messages.join(', ')
}

const getColor = messageTypes => {
  if ('error' in messageTypes) {
    return 'red'
  }

  if ('warning' in messageTypes) {
    return 'yellow'
  }

  return 'brightgreen'
}

const getSchema = preset => {
  if (!preset) return undefined
  const decodedPreset = decodeURI(preset)
  const schema = []
  if (new RegExp(html4Expression, 'i').test(decodedPreset)) {
    if (/Strict/i.test(decodedPreset)) {
      schema.push('http://s.validator.nu/xhtml10/xhtml-strict.rnc')
    } else if (/Transitional/i.test(decodedPreset)) {
      schema.push('http://s.validator.nu/xhtml10/xhtml-transitional.rnc')
    } else {
      schema.push('http://s.validator.nu/xhtml10/xhtml-frameset.rnc')
    }
    schema.push('http://c.validator.nu/all-html4/')
  } else if (/1\.0 Strict, URL, Ruby, SVG 1\.1/i.test(decodedPreset)) {
    schema.push('http://s.validator.nu/xhtml1-ruby-rdf-svg-mathml.rnc')
    schema.push('http://c.validator.nu/all-html4/')
  } else {
    if (new RegExp(html5Expression, 'i').test(decodedPreset)) {
      if (/ITS 2\.0/i.test(decodedPreset)) {
        schema.push('http://s.validator.nu/html5-its.rnc')
      } else if (/RDFa Lite 1\.1/i.test(decodedPreset)) {
        schema.push('http://s.validator.nu/html5-rdfalite.rnc')
      } else {
        schema.push('http://s.validator.nu/html5.rnc')
      }
    } else if (new RegExp(xhtmlExpression, 'i').test(decodedPreset)) {
      if (/RDFa Lite 1\.1/i.test(decodedPreset)) {
        schema.push('http://s.validator.nu/xhtml5-rdfalite.rnc')
      } else {
        schema.push('http://s.validator.nu/xhtml5.rnc')
      }
    } else if (new RegExp(svgExpression, 'i').test(decodedPreset)) {
      schema.push('http://s.validator.nu/svg-xhtml5-rdf-mathml.rnc')
    }
    schema.push('http://s.validator.nu/html5/assertions.sch')
    schema.push('http://c.validator.nu/all/')
  }
  return schema.map(url => encodeURI(url)).join(' ')
}

const description = `<p>
  The W3C validation badge performs validation of the HTML, SVG, MathML, ITS, RDFa Lite, XHTML documents.
  The badge uses the type property of each message found in the messages from the validation results to determine to be an error or warning.
  The rules are as follows:
  <ul>
    <li>info:  These messages are counted as warnings</li>
    <li>error:  These messages are counted as errors</li>
    <li>non-document-error: These messages are counted as errors</li>
  </ul>
</p>
<p>
  This badge relies on the <a target="_blank" href="https://validator.nu/">https://validator.nu/</a> service to perform the validation.
  Please refer to <a target="_blank" href="https://about.validator.nu/">https://about.validator.nu/</a> for the full documentation and Terms of service.
</p>
`

export { description, presetRegex, getColor, getMessage, getSchema }
