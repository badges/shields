'use strict'

const { test, given, forCases } = require('sazerac')
const { prepareRoute, namedParamsForMatch } = require('./route')

describe('Route helpers', function() {
  context('A `pattern` with a named param is declared', function() {
    const { regex, captureNames } = prepareRoute({
      base: 'foo',
      pattern: ':namedParamA',
      queryParams: ['queryParamA'],
    })

    const regexExec = str => regex.exec(str)
    test(regexExec, () => {
      forCases([
        given('/foo/bar.bar.bar.zip'),
        given('/foo/bar/bar.svg'),
        // This is a valid example with the wrong extension separator, to
        // test that we only accept a `.`.
        given('/foo/bar.bar.bar_svg'),
      ]).expect(null)
    })

    const namedParams = str =>
      namedParamsForMatch(captureNames, regex.exec(str))
    test(namedParams, () => {
      forCases([
        given('/foo/bar.bar.bar.svg'),
        given('/foo/bar.bar.bar.png'),
        given('/foo/bar.bar.bar.gif'),
        given('/foo/bar.bar.bar.jpg'),
        given('/foo/bar.bar.bar.json'),
      ]).expect({ namedParamA: 'bar.bar.bar' })
    })
  })

  context('A `format` with a named param is declared', function() {
    const { regex, captureNames } = prepareRoute({
      base: 'foo',
      format: '([^/]+)',
      capture: ['namedParamA'],
    })

    const regexExec = str => regex.exec(str)
    test(regexExec, () => {
      forCases([
        given('/foo/bar.bar.bar.zip'),
        given('/foo/bar/bar.svg'),
        // This is a valid example with the wrong extension separator, to
        // test that we only accept a `.`.
        given('/foo/bar.bar.bar_svg'),
      ]).expect(null)
    })

    const namedParams = str =>
      namedParamsForMatch(captureNames, regex.exec(str))
    test(namedParams, () => {
      forCases([
        given('/foo/bar.bar.bar.svg'),
        given('/foo/bar.bar.bar.png'),
        given('/foo/bar.bar.bar.gif'),
        given('/foo/bar.bar.bar.jpg'),
        given('/foo/bar.bar.bar.json'),
      ]).expect({ namedParamA: 'bar.bar.bar' })
    })
  })

  context('No named params are declared', function() {
    const { regex, captureNames } = prepareRoute({
      base: 'foo',
      format: '(?:[^/]+)',
    })

    const namedParams = str =>
      namedParamsForMatch(captureNames, regex.exec(str))
    test(namedParams, () => {
      forCases([
        given('/foo/bar.bar.bar.svg'),
        given('/foo/bar.bar.bar.png'),
        given('/foo/bar.bar.bar.gif'),
        given('/foo/bar.bar.bar.jpg'),
        given('/foo/bar.bar.bar.json'),
      ]).expect({})
    })
  })
})
