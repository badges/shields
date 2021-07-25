import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isErrorOnly = Joi.string().regex(/^[0-9]+ errors?$/)

const isWarningOnly = Joi.string().regex(/^[0-9]+ warnings?$/)

const isErrorAndWarning = Joi.string().regex(
  /^[0-9]+ errors?, [0-9]+ warnings?$/
)

const isW3CMessage = Joi.alternatives().try(
  'validated',
  isErrorOnly,
  isWarningOnly,
  isErrorAndWarning
)
const isW3CColors = Joi.alternatives().try('brightgreen', 'red', 'yellow')
t.create(
  'W3C Validation page conforms to standards with no preset and parser with brightgreen badge'
)
  .get(
    '/default.json?targetUrl=https://hsivonen.com/test/moz/messages-types/no-message.html'
  )
  .expectBadge({
    label: 'w3c',
    message: isW3CMessage,
    color: isW3CColors,
  })

t.create(
  'W3C Validation page conforms to standards with no HTML4 preset and HTML parser with brightgreen badge'
)
  .get(
    '/html.json?targetUrl=https://hsivonen.com/test/moz/messages-types/no-message.html&preset=HTML,%20SVG%201.1,%20MathML%203.0'
  )
  .expectBadge({
    label: 'w3c',
    message: isW3CMessage,
    color: isW3CColors,
  })

t.create('W3C Validation target url not found error')
  .get(
    '/default.json?targetUrl=http://hsivonen.com/test/moz/messages-types/404.html'
  )
  .expectBadge({
    label: 'w3c',
    message: 'target url not found',
  })

t.create('W3C Validation target url host not found error')
  .get('/default.json?targetUrl=https://adfasdfasdfasdfadfadfadfasdfadf.com')
  .expectBadge({
    label: 'w3c',
    message: 'target url not found',
  })

t.create('W3C Validation page has 1 validation error with red badge')
  .get(
    '/default.json?targetUrl=http://hsivonen.com/test/moz/messages-types/warning.html'
  )
  .expectBadge({
    label: 'w3c',
    message: isW3CMessage,
    color: isW3CColors,
  })

t.create(
  'W3C Validation page has 3 validation error using HTML 4.01 Frameset preset with red badge'
)
  .get(
    '/html.json?targetUrl=http://hsivonen.com/test/moz/messages-types/warning.html&preset=HTML 4.01 Frameset, URL / XHTML 1.0 Frameset, URL'
  )
  .expectBadge({
    label: 'w3c',
    message: isW3CMessage,
    color: isW3CColors,
  })

t.create('W3C Validation page has 1 validation warning with yellow badge')
  .get(
    '/default.json?targetUrl=http://hsivonen.com/test/moz/messages-types/info.svg'
  )
  .expectBadge({
    label: 'w3c',
    message: isW3CMessage,
    color: isW3CColors,
  })

t.create('W3C Validation page has multiple of validation errors with red badge')
  .get(
    '/default.json?targetUrl=http://hsivonen.com/test/moz/messages-types/range-error.html'
  )
  .expectBadge({
    label: 'w3c',
    message: isW3CMessage,
    color: isW3CColors,
  })
