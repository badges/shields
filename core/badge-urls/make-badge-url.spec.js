'use strict'

const { test, given } = require('sazerac')
const {
  badgeUrlFromPath,
  badgeUrlFromPattern,
  encodeField,
  staticBadgeUrl,
} = require('./make-badge-url')

describe('Badge URL generation functions', function() {
  test(badgeUrlFromPath, () => {
    given({
      baseUrl: 'http://example.com',
      path: '/npm/v/gh-badges',
      style: 'flat-square',
      longCache: true,
    }).expect(
      'http://example.com/npm/v/gh-badges.svg?maxAge=2592000&style=flat-square'
    )
  })

  test(badgeUrlFromPattern, () => {
    given({
      baseUrl: 'http://example.com',
      pattern: '/npm/v/:packageName',
      namedParams: { packageName: 'gh-badges' },
      style: 'flat-square',
      longCache: true,
    }).expect(
      'http://example.com/npm/v/gh-badges.svg?maxAge=2592000&style=flat-square'
    )
  })

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
    given({
      label: 'foo',
      message: 'bar',
      color: 'blue',
      style: 'flat-square',
      format: 'png',
    }).expect('/badge/foo-bar-blue.png?style=flat-square')
    given({
      label: 'Hello World',
      message: 'Привет Мир',
      color: '#aabbcc',
    }).expect(
      '/badge/Hello%20World-%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82%20%D0%9C%D0%B8%D1%80-%23aabbcc.svg'
    )
    given({
      label: '123-123',
      message: 'abc-abc',
      color: 'blue',
    }).expect('/badge/123--123-abc--abc-blue.svg')
  })
})
