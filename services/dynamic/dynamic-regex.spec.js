import { expect } from 'chai'
import { test, given } from 'sazerac'
import { InvalidParameter, InvalidResponse } from '../index.js'
import DynamicRegex from './dynamic-regex.service.js'

describe('validate function', function () {
  it('validates flags correctly', function () {
    expect(() => DynamicRegex.validate(undefined)).to.not.throw()
    expect(() => DynamicRegex.validate('')).to.not.throw()
    expect(() => DynamicRegex.validate('i')).to.not.throw()
    expect(() => DynamicRegex.validate('m')).to.not.throw()
    expect(() => DynamicRegex.validate('s')).to.not.throw()
    expect(() => DynamicRegex.validate('U')).to.not.throw()
    expect(() => DynamicRegex.validate('-imsU')).to.not.throw()
    expect(() => DynamicRegex.validate('-imsU0')).to.throw(InvalidParameter)
  })
})

describe('transform function', function () {
  it('invalid regexes', function () {
    expect(() =>
      DynamicRegex.transform('', 'x(?=y)', undefined, undefined),
    ).to.throw(InvalidParameter)
    expect(() =>
      DynamicRegex.transform('', '(.)\\1', undefined, undefined),
    ).to.throw(InvalidParameter)
    expect(() =>
      DynamicRegex.transform('', '\\V', undefined, undefined),
    ).to.throw(InvalidParameter)
    expect(() =>
      DynamicRegex.transform('', '\\U', undefined, undefined),
    ).to.throw(InvalidParameter)
    expect(() =>
      DynamicRegex.transform('', '(*ACCEPT)', undefined, undefined),
    ).to.throw(InvalidParameter)
  })

  it('no result', function () {
    expect(() =>
      DynamicRegex.transform('abc', 'x', undefined, undefined),
    ).to.throw(InvalidResponse)
    expect(() =>
      DynamicRegex.transform('abc', 'A', undefined, undefined),
    ).to.throw(InvalidResponse)
    expect(() =>
      DynamicRegex.transform('abc', '^b', undefined, undefined),
    ).to.throw(InvalidResponse)
  })

  it('found result', function () {
    test(DynamicRegex.transform, () => {
      given('abc', '.*', undefined, undefined).expect('abc')
      given('abc', '.b', undefined, undefined).expect('ab')
      given('abc', 'c$', undefined, undefined).expect('c')
    })
  })

  it('ReDoS', function () {
    const redosInput = `${'a'.repeat(1000)}x`
    expect(() =>
      DynamicRegex.transform(redosInput, '(a|a)+$', undefined, undefined),
    ).to.throw(InvalidResponse)
    expect(() =>
      DynamicRegex.transform(redosInput, '(a+)*$', undefined, undefined),
    ).to.not.throw()
    expect(() =>
      DynamicRegex.transform(redosInput, 'a*b?a*c', undefined, undefined),
    ).to.throw(InvalidResponse)
  })

  it('replace result', function () {
    test(DynamicRegex.transform, () => {
      given('abc', 'a(.)c', '$1', undefined).expect('b')
      given('abc', '(.)(.)', '$2', undefined).expect('b')
      given('abc', '(?<x>.)', '$<x>', undefined).expect('a')
    })
  })

  it('flags usage', function () {
    test(DynamicRegex.transform, () => {
      given('abc', 'A', undefined, '-i').expect('a')
      given('abc\ndef', '^d', undefined, 'm').expect('d')
      given('abc\ndef', 'c(.)', '$1', 's').expect('\n')
    })
  })
})
