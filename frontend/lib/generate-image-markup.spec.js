import { test, given } from 'sazerac'
import generateAllMarkup, {
  markdown,
  reStructuredText,
  asciiDoc,
} from './generate-image-markup'

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
})

test(reStructuredText, () => {
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

test(asciiDoc, () => {
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

test(generateAllMarkup, () => {
  given(
    'https://img.shields.io/badge.svg',
    'https://example.com/example',
    'Example'
  ).expect({
    markdown:
      '[![Example](https://img.shields.io/badge.svg)](https://example.com/example)',
    reStructuredText:
      '.. image:: https://img.shields.io/badge.svg   :alt: Example   :target: https://example.com/example',
    asciiDoc:
      'image:https://img.shields.io/badge.svg["Example",link="https://example.com/example"]',
  })
})
