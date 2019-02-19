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
    'https://img.shields.io/badge.svg',
    'https://example.com/example',
    'Example'
  ).expect('https://img.shields.io/badge.svg')
})

test(html, () => {
  given(
    'https://img.shields.io/badge.svg',
    'https://example.com/example',
    'Example'
  ).expect(
    '<a href="https://example.com/example"><img alt="Example" src="https://img.shields.io/badge.svg"></a>'
  )
  given('https://img.shields.io/badge.svg', undefined, undefined).expect(
    '<img src="https://img.shields.io/badge.svg">'
  )
})

test(markdown, () => {
  given('https://img.shields.io/badge.svg', undefined, 'Example').expect(
    '![Example](https://img.shields.io/badge.svg)'
  )
  given(
    'https://img.shields.io/badge.svg',
    'https://example.com/example',
    'Example'
  ).expect(
    '[![Example](https://img.shields.io/badge.svg)](https://example.com/example)'
  )
  given('https://img.shields.io/badge.svg', undefined, undefined).expect(
    '![](https://img.shields.io/badge.svg)'
  )
})

test(reStructuredText, () => {
  given('https://img.shields.io/badge.svg', undefined, undefined).expect(
    '.. image:: https://img.shields.io/badge.svg'
  )
  given('https://img.shields.io/badge.svg', undefined, 'Example').expect(
    '.. image:: https://img.shields.io/badge.svg   :alt: Example'
  )
  given(
    'https://img.shields.io/badge.svg',
    'https://example.com/example',
    'Example'
  ).expect(
    '.. image:: https://img.shields.io/badge.svg   :alt: Example   :target: https://example.com/example'
  )
})

test(renderAsciiDocAttributes, () => {
  given(['abc', '123'], {}).expect('[abc,123]')
  given(['abc', '123', null], { foo: 'def', bar: 'hello, world!' }).expect(
    '["abc","123",None,foo="def",bar="hello, world!"]'
  )
})

test(asciiDoc, () => {
  given('https://img.shields.io/badge.svg', undefined, undefined).expect(
    'image:https://img.shields.io/badge.svg[]'
  )
  given('https://img.shields.io/badge.svg', undefined, 'Example').expect(
    'image:https://img.shields.io/badge.svg[Example]'
  )
  given(
    'https://img.shields.io/badge.svg',
    undefined,
    'Example, with comma'
  ).expect('image:https://img.shields.io/badge.svg["Example, with comma"]')
  given(
    'https://img.shields.io/badge.svg',
    'https://example.com/example',
    'Example'
  ).expect(
    'image:https://img.shields.io/badge.svg["Example",link="https://example.com/example"]'
  )
})

test(generateMarkup, () => {
  given({
    badgeUrl: 'https://img.shields.io/badge.svg',
    link: 'https://example.com/example',
    title: 'Example',
    markupFormat: 'markdown',
  }).expect(
    '[![Example](https://img.shields.io/badge.svg)](https://example.com/example)'
  )
})
