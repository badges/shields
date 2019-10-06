'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('W3C Validation page conforms to standards with no preset and parser')
  .get(
    '/doc.json?doc=https://hsivonen.com/test/moz/messages-types/no-message.html&preset=&parser='
  )
  .expectBadge({
    label: 'w3c',
    message: 'validated',
    color: 'brightgreen',
  })

t.create(
  'W3C Validation page conforms to standards with no HTML5 preset and HTML parser'
)
  .get(
    '/doc.json?doc=https://hsivonen.com/test/moz/messages-types/no-message.html&preset=HTML, SVG 1.1, MathML 3.0&parser=html'
  )
  .expectBadge({
    label: 'w3c',
    message: 'validated',
    color: 'brightgreen',
  })

t.create('W3C Validation fatal document error')
  .get(
    '/doc.json?doc=http://hsivonen.com/test/moz/messages-types/404.html&preset=&parser='
  )
  .expectBadge({
    label: 'w3c',
    message: '1 error',
    color: 'red',
  })

t.create('W3C Validation page has 1 validation error')
  .get(
    '/doc.json?doc=http://hsivonen.com/test/moz/messages-types/warning.html&preset=&parser='
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
    '/doc.json?doc=http://hsivonen.com/test/moz/messages-types/warning.html&preset=HTML 4.01 Frameset, URL / XHTML 1.0 Frameset, URL&parser=html'
  )
  .expectBadge({
    label: 'w3c',
    message: '3 errors',
    color: 'red',
  })

t.create('W3C Validation page has 1 validation warning')
  .get(
    '/doc.json?doc=http://hsivonen.com/test/moz/messages-types/info.svg&preset=&parser='
  )
  .expectBadge({
    label: 'w3c',
    message: '1 warning',
    color: 'yellow',
  })

t.create('W3C Validation page has multiple of validation errors')
  .get(
    '/doc.json?doc=http://hsivonen.com/test/moz/messages-types/range-error.html&preset=&parser='
  )
  .expectBadge({
    label: 'w3c',
    message: '2 errors',
    color: 'red',
  })

t.create(
  'W3C Validation page has a combination of validation errors and warnings'
)
  .get('/doc.json?doc=https://shields.io&preset=&parser')
  .expectBadge({
    label: 'w3c',
    message: '45 errors, 4 warnings',
    color: 'red',
  })
