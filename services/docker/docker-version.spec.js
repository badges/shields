'use strict'

const { expect } = require('chai')
const { test, given } = require('sazerac')
const { InvalidResponse } = require('..')
const DockerVersion = require('./docker-version.service')
const {
  versionDataNoTagDateSort,
  versionPagedDataNoTagDateSort,
  versionDataNoTagSemVerSort,
  versionDataWithTag,
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
      data: versionDataNoTagDateSort,
      pagedData: versionPagedDataNoTagDateSort,
    }).expect({
      version: 'amd64-latest',
    })
    given({
      tag: '',
      sort: 'semver',
      data: versionDataNoTagSemVerSort,
    }).expect({
      version: '3.11.3',
    })
    given({
      tag: '3.10',
      data: versionDataWithTag,
    }).expect({
      version: '3.10.4',
    })
  })

  it('throws InvalidResponse error with latest tag and no amd64 architecture digests', function() {
    expect(() => {
      DockerVersion.prototype.transform({
        sort: 'date',
        data: {
          results: [
            {
              name: 'latest',
              images: [
                {
                  architecture: 'arm64',
                  digest:
                    'sha256:597bd5c319cc09d6bb295b4ef23cac50ec7c373fff5fe923cfd246ec09967b31',
                },
                {
                  architecture: 'arm',
                  digest:
                    'sha256:c5ea49127cd44d0f50eafda229a056bb83b6e691883c56fd863d42675fae3909',
                },
              ],
            },
          ],
        },
      })
    })
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'digest not found for latest tag')
  })
})
