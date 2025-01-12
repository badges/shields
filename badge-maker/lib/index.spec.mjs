'use strict'

import { expect } from 'chai'
import { makeBadge, ValidationError } from './index.js'

describe('makeBadge function', function () {
  it('should produce badge with valid input', async function () {
    const { default: isSvg } = await import('is-svg')
    expect(
      makeBadge({
        label: 'build',
        message: 'passed',
      }),
    ).to.satisfy(isSvg)
    expect(
      makeBadge({
        message: 'passed',
      }),
    ).to.satisfy(isSvg)
    expect(
      makeBadge({
        label: 'build',
        message: 'passed',
        color: 'green',
        style: 'flat',
      }),
    ).to.satisfy(isSvg)
    expect(
      makeBadge({
        label: 'build',
        message: 'passed',
        color: 'green',
        style: 'flat',
        labelColor: 'blue',
        logoBase64: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
        links: ['https://example.com', 'https://example.com'],
      }),
    )
      .to.satisfy(isSvg)
      // explicitly make an assertion about logoBase64
      // this param is not a straight passthrough
      .and.to.include('data:image/svg+xml;base64,PHN2ZyB4bWxu')
  })

  it('should throw a ValidationError with invalid inputs', function () {
    ;[null, undefined, 7, 'foo', 4.25].forEach(x => {
      console.log(x)
      expect(() => makeBadge(x)).to.throw(
        ValidationError,
        'makeBadge takes an argument of type object',
      )
    })
    expect(() => makeBadge({})).to.throw(
      ValidationError,
      'Field `message` is required',
    )
    expect(() => makeBadge({ label: 'build' })).to.throw(
      ValidationError,
      'Field `message` is required',
    )
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', labelColor: 7 }),
    ).to.throw(ValidationError, 'Field `labelColor` must be of type string')
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', logoBase64: 7 }),
    ).to.throw(ValidationError, 'Field `logoBase64` must be of type string')
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', links: 'test' }),
    ).to.throw(ValidationError, 'Field `links` must be an array of strings')
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', links: [1] }),
    ).to.throw(ValidationError, 'Field `links` must be an array of strings')
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', links: ['1', '2', '3'] }),
    ).to.throw(
      ValidationError,
      'Field `links` must not have more than 2 elements',
    )
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', format: 'png' }),
    ).to.throw(ValidationError, "Unexpected field 'format'")
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', template: 'flat' }),
    ).to.throw(ValidationError, "Unexpected field 'template'")
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', foo: 'bar' }),
    ).to.throw(ValidationError, "Unexpected field 'foo'")
    expect(() =>
      makeBadge({
        label: 'build',
        message: 'passed',
        style: 'something else',
      }),
    ).to.throw(
      ValidationError,
      'Field `style` must be one of (plastic,flat,flat-square,for-the-badge,social)',
    )
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', style: 'popout' }),
    ).to.throw(
      ValidationError,
      'Field `style` must be one of (plastic,flat,flat-square,for-the-badge,social)',
    )
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', idSuffix: '\\' }),
    ).to.throw(
      ValidationError,
      'Field `idSuffix` must contain only numbers, letters, -, and _',
    )
  })
})
