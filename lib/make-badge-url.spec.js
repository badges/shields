'use strict'

const { test, given } = require('sazerac')
const { encodeField, staticBadgeUrl } = require('./make-badge-url')

describe('Badge URL generation functions', function() {
  test(encodeField, () => {
    given('foo').expect('foo')
    given('').expect('')
    given('happy go lucky').expect('happy%20go%20lucky')
    given('do-right').expect('do--right')
    given('it_is_a_snake').expect('it__is__a__snake')
  })

  test(staticBadgeUrl, () => {
    given({
      label: 'foo',
      message: 'bar',
      color: 'blue',
      style: 'flat-square',
    }).expect('/badge/foo-bar-blue.svg?style=flat-square')
  })
})
