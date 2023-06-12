import { test, given } from 'sazerac'
import {
  bareLink,
  html,
  markdown,
  reStructuredText,
  renderAsciiDocAttributes,
  asciiDoc,
  generateMarkup,
} from './generate-image-markup'

test(bareLink, () => {
  given(
    'https://img.shields.io/badge',
    'https://example.com/example',
    'Example'
  ).expect('https://img.shields.io/badge')
})

test(html, () => {
  given('https://img.shields.io/badge', 'Example').expect(
    '<img alt="Example" src="https://img.shields.io/badge">'
  )
  given('https://img.shields.io/badge', undefined).expect(
    '<img src="https://img.shields.io/badge">'
  )
})

test(markdown, () => {
  given('https://img.shields.io/badge', 'Example').expect(
    '![Example](https://img.shields.io/badge)'
  )
  given('https://img.shields.io/badge', undefined).expect(
    '![](https://img.shields.io/badge)'
  )
})

test(reStructuredText, () => {
  given('https://img.shields.io/badge', undefined).expect(
    '.. image:: https://img.shields.io/badge'
  )
  given('https://img.shields.io/badge', 'Example').expect(
    '.. image:: https://img.shields.io/badge\n   :alt: Example'
  )
})

test(renderAsciiDocAttributes, () => {
  given(['abc', '123'], {}).expect('[abc,123]')
  given(['abc', '123', null], { foo: 'def', bar: 'hello, world!' }).expect(
    '["abc","123",None,foo="def",bar="hello, world!"]'
  )
})

test(asciiDoc, () => {
  given('https://img.shields.io/badge', undefined).expect(
    'image:https://img.shields.io/badge[]'
  )
  given('https://img.shields.io/badge', 'Example').expect(
    'image:https://img.shields.io/badge[Example]'
  )
  given('https://img.shields.io/badge', 'Example, with comma').expect(
    'image:https://img.shields.io/badge["Example, with comma"]'
  )
})

test(generateMarkup, () => {
  given({
    badgeUrl: 'https://img.shields.io/badge',
    title: 'Example',
    markupFormat: 'markdown',
  }).expect('![Example](https://img.shields.io/badge)')
})
