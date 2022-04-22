import { expect } from 'chai'
import Joi from 'joi'
import { test, given } from 'sazerac'
import { prepareRoute, paramsForReq, getQueryParamNames } from './route.js'

function paramsForPath({ regex, captureNames, ServiceClass }, path) {
  // Prepare a mock express `req` object.
  const params = {}
  regex.exec(path).forEach((param, i) => {
    // regex.exec(path)[0] contains the entire path. We want [1] ... [n].
    if (i > 0) {
      params[i - 1] = param
    }
  })
  const req = { params }

  return paramsForReq(captureNames, req, ServiceClass)
}

describe('Route helpers', function () {
  const ServiceClass = { name: 'MyService' }

  context('A `pattern` with a named param is declared', function () {
    const { regex, captureNames } = prepareRoute({
      base: 'foo',
      pattern: ':namedParamA',
      queryParamSchema: Joi.object({ queryParamA: Joi.string() }).required(),
    })

    const regexExec = path => regex.exec(path)
    test(regexExec, () => {
      given('/foo/bar/bar.svg').expect(null)
    })

    const params = path =>
      paramsForPath({ regex, captureNames, ServiceClass }, path)
    test(params, () => {
      given('/foo/bar.bar.bar.svg').expect({
        namedParams: { namedParamA: 'bar.bar.bar' },
        format: 'svg',
      })
      given('/foo/bar.bar.bar.json').expect({
        namedParams: { namedParamA: 'bar.bar.bar' },
        format: 'json',
      })
      // This pattern catches bugs related to escaping the extension separator.
      given('/foo/bar.bar.bar_svg').expect({
        namedParams: { namedParamA: 'bar.bar.bar_svg' },
        format: 'svg',
      })
      given('/foo/bar.bar.bar.zip').expect({
        namedParams: { namedParamA: 'bar.bar.bar.zip' },
        format: 'svg',
      })
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

    const params = path =>
      paramsForPath({ regex, captureNames, ServiceClass }, path)
    test(params, () => {
      given('/foo/bar.bar.bar.svg').expect({
        namedParams: { namedParamA: 'bar.bar.bar' },
        format: 'svg',
      })
      given('/foo/bar.bar.bar.json').expect({
        namedParams: { namedParamA: 'bar.bar.bar' },
        format: 'json',
      })

      // This pattern catches bugs related to escaping the extension separator.
      given('/foo/bar.bar.bar_svg').expect({
        namedParams: { namedParamA: 'bar.bar.bar_svg' },
        format: 'svg',
      })
      given('/foo/bar.bar.bar.zip').expect({
        namedParams: { namedParamA: 'bar.bar.bar.zip' },
        format: 'svg',
      })
    })
  })

  context('No named params are declared', function () {
    const { regex, captureNames } = prepareRoute({
      base: 'foo',
      format: '(?:[^/]+?)',
    })

    const params = path =>
      paramsForPath({ regex, captureNames, ServiceClass }, path)
    test(params, () => {
      given('/foo/bar.bar.bar.svg').expect({ namedParams: {}, format: 'svg' })
      given('/foo/bar.bar.bar.json').expect({ namedParams: {}, format: 'json' })
    })
  })

  context('The wrong number of params are declared', function () {
    const { regex, captureNames } = prepareRoute({
      base: 'foo',
      format: '([^/]+)/([^/]+)',
      capture: ['namedParamA'],
    })

    it('Throws the expected error', function () {
      expect(() =>
        paramsForPath({ regex, captureNames, ServiceClass }, '/foo/bar/baz.svg')
      ).to.throw(
        'Service MyService declares incorrect number of named params (expected 2, got 1)'
      )
    })
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
