import { test, given } from 'sazerac'
import DockerSize from './docker-size.service.js'
import { sizeDataNoTagSemVerSort } from './docker-fixtures.js'

describe('DockerSize', function () {
  test(DockerSize.prototype.transform, () => {
    given({
      tag: '',
      sort: 'date',
      data: { results: [{ name: 'next', full_size: 219939484 }] },
    }).expect({
      size: 219939484,
    })
    given({
      tag: '',
      sort: 'date',
      data: {
        results: [
          { name: 'latest', full_size: 74661264 },
          { name: 'arm64v8-latest', full_size: 76310416 },
          { name: 'arm32v7-latest', full_size: 68001970 },
          { name: 'amd64-latest', full_size: 74661264 },
        ],
      },
    }).expect({
      size: 74661264,
    })
    given({
      tag: '',
      sort: 'semver',
      data: sizeDataNoTagSemVerSort,
    }).expect({
      size: 13448411,
    })
    given({
      tag: 'latest',
      data: { name: 'latest', full_size: 13448411 },
    }).expect({
      size: 13448411,
    })
  })
})
