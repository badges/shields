import { expect } from 'chai'
import Joi from 'joi'
import { test, given, forCases } from 'sazerac'
import {
  prepareRoute,
  namedParamsForMatch,
  getQueryParamNames,
} from './route.js'

describe('Route helpers', function () {
  context('A `pattern` with a named param is declared', function () {
    const { regex, captureNames } = prepareRoute({
      base: 'foo',
      pattern: ':namedParamA',
      queryParamSchema: Joi.object({ queryParamA: Joi.string() }).required(),
    })

    const regexExec = str => regex.exec(str)
    test(regexExec, () => {
      given('/foo/bar/bar.svg').expect(null)
    })

    const namedParams = str =>
      namedParamsForMatch(captureNames, regex.exec(str))
    test(namedParams, () => {
      forCases([
        given('/foo/bar.bar.bar.svg'),
        given('/foo/bar.bar.bar.json'),
      ]).expect({ namedParamA: 'bar.bar.bar' })

      // This pattern catches bugs related to escaping the extension separator.
      given('/foo/bar.bar.bar_svg').expect({ namedParamA: 'bar.bar.bar_svg' })
      given('/foo/bar.bar.bar.zip').expect({ namedParamA: 'bar.bar.bar.zip' })
    })
  })

  context('A `format` with a named param is declared', function () {
    const { regex, captureNames } = prepareRoute({
      base: 'foo',
      format: '([^/]+?)',
      capture: ['namedParamA'],
    })

    const regexExec = str => regex.exec(str)
    test(regexExec, () => {
      given('/foo/bar/bar.svg').expect(null)
    })

    const namedParams = str =>
      namedParamsForMatch(captureNames, regex.exec(str))
    test(namedParams, () => {
      forCases([
        given('/foo/bar.bar.bar.svg'),
        given('/foo/bar.bar.bar.json'),
      ]).expect({ namedParamA: 'bar.bar.bar' })

      // This pattern catches bugs related to escaping the extension separator.
      given('/foo/bar.bar.bar_svg').expect({ namedParamA: 'bar.bar.bar_svg' })
      given('/foo/bar.bar.bar.zip').expect({ namedParamA: 'bar.bar.bar.zip' })
    })
  })

  context('No named params are declared', function () {
    const { regex, captureNames } = prepareRoute({
      base: 'foo',
      format: '(?:[^/]+)',
    })

    const namedParams = str =>
      namedParamsForMatch(captureNames, regex.exec(str))
    test(namedParams, () => {
      forCases([
        given('/foo/bar.bar.bar.svg'),
        given('/foo/bar.bar.bar.json'),
      ]).expect({})
    })
  })

  context('The wrong number of params are declared', function () {
    const { regex, captureNames } = prepareRoute({
      base: 'foo',
      format: '([^/]+)/([^/]+)',
      capture: ['namedParamA'],
    })

    expect(() =>
      namedParamsForMatch(captureNames, regex.exec('/foo/bar/baz.svg'), {
        name: 'MyService',
      })
    ).to.throw(
      'Service MyService declares incorrect number of named params (expected 2, got 1)'
    )
  })

  it('getQueryParamNames', function () {
    expect(
      getQueryParamNames({
        queryParamSchema: Joi.object({ foo: Joi.string() }).required(),
      })
    ).to.deep.equal(['foo'])
    expect(
      getQueryParamNames({
        queryParamSchema: Joi.object({ foo: Joi.string() })
          .rename('bar', 'foo', { ignoreUndefined: true, override: true })
          .required(),
      })
    ).to.deep.equal(['foo', 'bar'])
  })
})
