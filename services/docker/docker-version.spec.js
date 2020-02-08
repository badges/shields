'use strict'

const { test, given } = require('sazerac')
const DockerVersion = require('./docker-version.service')
const {
  dataNoTagDateSort,
  pagedDataNoTagDateSort,
  dataNoTagSemVerSort,
  dataWithTag,
} = require('./docker-fixtures')

describe('DockerVersion', function() {
  test(DockerVersion.prototype.transform, () => {
    given({
      tag: '',
      sort: 'date',
      data: { results: [{ name: 'stable' }] },
    }).expect({
      version: 'stable',
    })
    given({
      tag: '',
      sort: 'date',
      data: { results: [{ name: '3.9.5' }] },
    }).expect({
      version: '3.9.5',
    })
    given({
      tag: '',
      sort: 'date',
      data: dataNoTagDateSort,
      pagedData: pagedDataNoTagDateSort,
    }).expect({
      version: 'amd64-latest',
    })
    given({
      tag: '',
      sort: 'semver',
      data: dataNoTagSemVerSort,
    }).expect({
      version: '3.11.3',
    })
    given({
      tag: '3.10',
      data: dataWithTag,
    }).expect({
      version: '3.10.4',
    })
  })
})
