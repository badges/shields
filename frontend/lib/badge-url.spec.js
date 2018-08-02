import { test, given } from 'sazerac'
import {
  default as resolveBadgeUrl,
  encodeField,
  staticBadgeUrl,
  dynamicBadgeUrl,
} from './badge-url'

const resolveBadgeUrlWithLongCache = (url, baseUrl) =>
  resolveBadgeUrl(url, baseUrl, { longCache: true })

describe('Badge URL functions', function() {
  test(resolveBadgeUrl, () => {
    given('/badge/foo-bar-blue.svg', undefined).expect(
      '/badge/foo-bar-blue.svg'
    )
    given('/badge/foo-bar-blue.svg', 'http://example.com').expect(
      'http://example.com/badge/foo-bar-blue.svg'
    )
  })

  test(resolveBadgeUrlWithLongCache, () => {
    given('/badge/foo-bar-blue.svg', undefined).expect(
      '/badge/foo-bar-blue.svg?maxAge=2592000'
    )
    given('/badge/foo-bar-blue.svg', 'http://example.com').expect(
      'http://example.com/badge/foo-bar-blue.svg?maxAge=2592000'
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
    given('http://img.example.com', 'foo', 'bar', 'blue', {
      style: 'plastic',
    }).expect('http://img.example.com/badge/foo-bar-blue.svg?style=plastic')
  })

  test(dynamicBadgeUrl, () => {
    const dataUrl = 'http://example.com/foo.json'
    const query = '$.bar'
    const prefix = 'value: '

    given('http://img.example.com', 'json', 'foo', dataUrl, query, {
      prefix,
      style: 'plastic',
    }).expect(
      [
        'http://img.example.com/badge/dynamic/json.svg',
        '?label=foo',
        `&url=${encodeURIComponent(dataUrl)}`,
        `&query=${encodeURIComponent(query)}`,
        `&prefix=${encodeURIComponent(prefix)}`,
        '&style=plastic',
      ].join('')
    )
  })
})
