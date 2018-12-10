import { test, given } from 'sazerac'
import generateAllMarkup from './generate-image-markup'

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
