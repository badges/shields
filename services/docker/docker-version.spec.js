import { expect } from 'chai'
import { test, given } from 'sazerac'
import { InvalidResponse } from '../index.js'
import DockerVersion from './docker-version.service.js'
import {
  versionDataNoTagDateSort,
  versionPagedDataNoTagDateSort,
  versionDataNoTagSemVerSort,
  versionDataWithTag,
  versionDataWithVaryingArchitectures,
} from './docker-fixtures.js'

describe('DockerVersion', function () {
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

    // tag & custom architecture
    given({
      tag: '3.9',
      data: versionDataWithVaryingArchitectures,
      arch: 'arm',
    }).expect({
      version: '3.9',
    })

    // sort & custom architecture
    given({
      data: versionDataWithVaryingArchitectures,
      sort: 'semver',
      arch: 'ppc64le',
    }).expect({
      version: '3.10.4',
    })
  })

  it('throws InvalidResponse error with latest tag and no amd64 architecture digests', function () {
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

  // https://github.com/badges/shields/issues/5535
  it('throws InvalidResponse error with custom tag and no amd64 architecture digests', function () {
    expect(() => {
      DockerVersion.prototype.transform({
        tag: '3.10',
        data: [
          {
            name: '3.10',
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
      })
    })
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'digest not found for given tag')
  })

  it('throws InvalidResponse error with custom tag and no matching architecture digests', function () {
    expect(() => {
      DockerVersion.prototype.transform({
        tag: '3.10',
        arch: '386',
        data: [
          {
            name: '3.9',
            images: [
              {
                digest:
                  'sha256:ab3fe83c0696e3f565c9b4a734ec309ae9bd0d74c192de4590fd6dc2ef717815',
                architecture: 'amd64',
              },
              {
                digest:
                  'sha256:c7b3e8392e08c971e98627e2bddd10c7fa9d2eae797a16bc94de9709bb9300d0',
                architecture: '386',
              },
              {
                digest:
                  'sha256:5292cebaf695db860087c5582d340a406613891b2819092747b0388da47936c8',
                architecture: 'arm',
              },
            ],
          },
          {
            name: '3.10',
            images: [
              {
                architecture: 'arm',
                digest:
                  'sha256:c5ea49127cd44d0f50eafda229a056bb83b6e691883c56fd863d42675fae3909',
              },
              {
                architecture: 'arm64',
                digest:
                  'sha256:597bd5c319cc09d6bb295b4ef23cac50ec7c373fff5fe923cfd246ec09967b31',
              },
            ],
          },
        ],
      })
    })
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'digest not found for given tag')
  })
})
