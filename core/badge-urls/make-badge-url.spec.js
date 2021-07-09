import { test, given } from 'sazerac'
import {
  badgeUrlFromPath,
  badgeUrlFromPattern,
  encodeField,
  staticBadgeUrl,
  queryStringStaticBadgeUrl,
  dynamicBadgeUrl,
} from './make-badge-url.js'

describe('Badge URL generation functions', function () {
  test(badgeUrlFromPath, () => {
    given({
      baseUrl: 'http://example.com',
      path: '/npm/v/gh-badges',
      style: 'flat-square',
      longCache: true,
    }).expect(
      'http://example.com/npm/v/gh-badges?cacheSeconds=2592000&style=flat-square'
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
      'http://example.com/npm/v/gh-badges?cacheSeconds=2592000&style=flat-square'
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
    }).expect('/badge/foo-bar-blue?style=flat-square')
    given({
      label: 'foo',
      message: 'bar',
      color: 'blue',
      style: 'flat-square',
      format: 'png',
      namedLogo: 'github',
    }).expect('/badge/foo-bar-blue.png?logo=github&style=flat-square')
    given({
      label: 'Hello World',
      message: 'Привет Мир',
      color: '#aabbcc',
    }).expect(
      '/badge/Hello%20World-%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82%20%D0%9C%D0%B8%D1%80-%23aabbcc'
    )
    given({
      label: '123-123',
      message: 'abc-abc',
      color: 'blue',
    }).expect('/badge/123--123-abc--abc-blue')
    given({
      label: '123-123',
      message: '',
      color: 'blue',
      style: 'social',
    }).expect('/badge/123--123--blue?style=social')
    given({
      label: '',
      message: 'blue',
      color: 'blue',
    }).expect('/badge/-blue-blue')
  })

  test(queryStringStaticBadgeUrl, () => {
    // the query-string library sorts parameters by name
    given({
      label: 'foo',
      message: 'bar',
      color: 'blue',
      style: 'flat-square',
    }).expect('/static/v1?color=blue&label=foo&message=bar&style=flat-square')
    given({
      label: 'foo Bar',
      message: 'bar Baz',
      color: 'blue',
      style: 'flat-square',
      format: 'png',
      namedLogo: 'github',
    }).expect(
      '/static/v1.png?color=blue&label=foo%20Bar&logo=github&message=bar%20Baz&style=flat-square'
    )
    given({
      label: 'Hello World',
      message: 'Привет Мир',
      color: '#aabbcc',
    }).expect(
      '/static/v1?color=%23aabbcc&label=Hello%20World&message=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82%20%D0%9C%D0%B8%D1%80'
    )
  })

  test(dynamicBadgeUrl, () => {
    const dataUrl = 'http://example.com/foo.json'
    const query = '$.bar'
    const prefix = 'value: '
    given({
      baseUrl: 'http://img.example.com',
      datatype: 'json',
      label: 'foo',
      dataUrl,
      query,
      prefix,
      style: 'plastic',
    }).expect(
      [
        'http://img.example.com/badge/dynamic/json',
        '?label=foo',
        `&prefix=${encodeURIComponent(prefix)}`,
        `&query=${encodeURIComponent(query)}`,
        '&style=plastic',
        `&url=${encodeURIComponent(dataUrl)}`,
      ].join('')
    )
    const suffix = '<- value'
    const color = 'blue'
    given({
      baseUrl: 'http://img.example.com',
      datatype: 'json',
      label: 'foo',
      dataUrl,
      query,
      suffix,
      color,
      style: 'plastic',
    }).expect(
      [
        'http://img.example.com/badge/dynamic/json',
        '?color=blue',
        '&label=foo',
        `&query=${encodeURIComponent(query)}`,
        '&style=plastic',
        `&suffix=${encodeURIComponent(suffix)}`,
        `&url=${encodeURIComponent(dataUrl)}`,
      ].join('')
    )
  })
})
