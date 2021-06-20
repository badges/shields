import { expect } from 'chai'
import { test, given } from 'sazerac'
import { validateExample, transformExample } from './examples.js'

describe('validateExample function', function () {
  it('passes valid examples', function () {
    const validExamples = [
      {
        title: 'Package manager versioning badge',
        staticPreview: { message: '123' },
        pattern: 'dt/:package',
        namedParams: { package: 'mypackage' },
        keywords: ['semver', 'management'],
      },
    ]

    validExamples.forEach(example => {
      expect(() =>
        validateExample(example, 0, { route: {}, name: 'mockService' })
      ).not.to.throw(Error)
    })
  })

  it('rejects invalid examples', function () {
    const invalidExamples = [
      {},
      { staticPreview: { message: '123' } },
      {
        staticPreview: { message: '123' },
        pattern: 'dt/:package',
        namedParams: { package: 'mypackage' },
        exampleUrl: 'dt/mypackage',
      },
      { staticPreview: { message: '123' }, pattern: 'dt/:package' },
      {
        staticPreview: { message: '123' },
        pattern: 'dt/:package',
        previewUrl: 'dt/mypackage',
      },
      {
        staticPreview: { message: '123' },
        pattern: 'dt/:package',
        exampleUrl: 'dt/mypackage',
      },
      { previewUrl: 'dt/mypackage' },
      {
        staticPreview: { message: '123' },
        pattern: 'dt/:package',
        namedParams: { package: 'mypackage' },
        keywords: ['a'], // Keyword too short.
      },
      {
        staticPreview: { message: '123' },
        pattern: 'dt/:package',
        namedParams: { package: 'mypackage' },
        keywords: ['mockService'], // No title and keyword matching the class name.
      },
      {
        title: 'Package manager versioning badge',
        staticPreview: { message: '123' },
        pattern: 'dt/:package',
        namedParams: { package: 'mypackage' },
        keywords: ['version'], // Keyword included in title.
      },
    ]

    invalidExamples.forEach(example => {
      expect(() =>
        validateExample(example, 0, { route: {}, name: 'mockService' })
      ).to.throw(Error)
    })
  })
})

test(transformExample, function () {
  const ExampleService = {
    name: 'ExampleService',
    route: {
      base: 'some-service',
      pattern: ':interval/:packageName',
    },
    defaultBadgeData: {
      label: 'downloads',
    },
    category: 'platform-support',
  }

  given(
    {
      pattern: 'dt/:packageName',
      namedParams: { packageName: 'express' },
      staticPreview: { message: '50k' },
      keywords: ['hello'],
    },
    0,
    ExampleService
  ).expect({
    title: 'ExampleService',
    example: {
      pattern: '/some-service/dt/:packageName',
      namedParams: { packageName: 'express' },
      queryParams: {},
    },
    preview: {
      label: 'downloads',
      message: '50k',
      color: 'lightgrey',
      namedLogo: undefined,
      style: undefined,
    },
    keywords: ['hello', 'platform'],
    documentation: undefined,
  })

  given(
    {
      namedParams: { interval: 'dt', packageName: 'express' },
      staticPreview: { message: '50k' },
      keywords: ['hello'],
    },
    0,
    ExampleService
  ).expect({
    title: 'ExampleService',
    example: {
      pattern: '/some-service/:interval/:packageName',
      namedParams: { interval: 'dt', packageName: 'express' },
      queryParams: {},
    },
    preview: {
      label: 'downloads',
      message: '50k',
      color: 'lightgrey',
      namedLogo: undefined,
      style: undefined,
    },
    keywords: ['hello', 'platform'],
    documentation: undefined,
  })

  given(
    {
      namedParams: { interval: 'dt', packageName: 'express' },
      queryParams: { registry_url: 'http://example.com/' },
      staticPreview: { message: '50k' },
      keywords: ['hello'],
    },
    0,
    ExampleService
  ).expect({
    title: 'ExampleService',
    example: {
      pattern: '/some-service/:interval/:packageName',
      namedParams: { interval: 'dt', packageName: 'express' },
      queryParams: { registry_url: 'http://example.com/' },
    },
    preview: {
      label: 'downloads',
      message: '50k',
      color: 'lightgrey',
      namedLogo: undefined,
      style: undefined,
    },
    keywords: ['hello', 'platform'],
    documentation: undefined,
  })
})
