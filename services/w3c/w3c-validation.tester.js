'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('W3C Validation page conforms to standards with no preset and parser')
  .get(
    '/default.json?targetUrl=https://hsivonen.com/test/moz/messages-types/no-message.html&preset='
  )
  .expectBadge({
    label: 'w3c',
    message: 'validated',
    color: 'brightgreen',
  })

t.create(
  'W3C Validation page conforms to standards with no HTML4 preset and HTML parser'
)
  .get(
    '/html.json?targetUrl=https://hsivonen.com/test/moz/messages-types/no-message.html&preset=HTML,%20SVG%201.1,%20MathML%203.0'
  )
  .expectBadge({
    label: 'w3c',
    message: 'validated',
    color: 'brightgreen',
  })

t.create('W3C Validation fatal document error')
  .get(
    '/default.json?targetUrl=http://hsivonen.com/test/moz/messages-types/404.html&preset='
  )
  .expectBadge({
    label: 'w3c',
    message: '1 error',
    color: 'red',
  })

t.create('W3C Validation page has 1 validation error')
  .get(
    '/default.json?targetUrl=http://hsivonen.com/test/moz/messages-types/warning.html&preset='
  )
  .expectBadge({
    label: 'w3c',
    message: '1 error',
    color: 'red',
  })

t.create(
  'W3C Validation page has 3 validation error using HTML 4.01 Frameset preset'
)
  .get(
    '/html.json?targetUrl=http://hsivonen.com/test/moz/messages-types/warning.html&preset=HTML 4.01 Frameset, URL / XHTML 1.0 Frameset, URL'
  )
  .expectBadge({
    label: 'w3c',
    message: '3 errors',
    color: 'red',
  })

t.create('W3C Validation page has 1 validation warning')
  .get(
    '/default.json?targetUrl=http://hsivonen.com/test/moz/messages-types/info.svg&preset='
  )
  .expectBadge({
    label: 'w3c',
    message: '1 warning',
    color: 'yellow',
  })

t.create('W3C Validation page has multiple of validation errors')
  .get(
    '/default.json?targetUrl=http://hsivonen.com/test/moz/messages-types/range-error.html&preset='
  )
  .expectBadge({
    label: 'w3c',
    message: '2 errors',
    color: 'red',
  })

t.create(
  'W3C Validation page has a combination of validation errors and warnings'
)
  .get('/default.json?targetUrl=https://shields.io&preset=')
  .expectBadge({
    label: 'w3c',
    message: '45 errors, 4 warnings',
    color: 'red',
  })
