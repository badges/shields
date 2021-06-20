import { test, given } from 'sazerac'
import PypiPythonVersions from './pypi-python-versions.service.js'

describe('PyPI Python Version', function () {
  test(PypiPythonVersions.render, function () {
    // Major versions are hidden if minor are present.
    given({ versions: ['3', '3.4', '3.5', '3.6', '2', '2.7'] }).expect({
      message: '2.7 | 3.4 | 3.5 | 3.6',
      color: 'blue',
    })

    // Major versions are shown when minor are missing.
    given({ versions: ['2', '3'] }).expect({
      message: '2 | 3',
      color: 'blue',
    })

    // Versions are properly sorted according to their Semver segments.
    given({ versions: ['3.10', '3.9', '3.8', '3.7', '3.6'] }).expect({
      message: '3.6 | 3.7 | 3.8 | 3.9 | 3.10',
      color: 'blue',
    })

    // Only "one" version works too.
    given({ versions: ['3', '3.9'] }).expect({
      message: '3.9',
      color: 'blue',
    })

    // Versions are missing...
    given({ versions: [] }).expect({
      message: 'missing',
      color: 'red',
    })
  })
})
