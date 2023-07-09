import { test, given } from 'sazerac'
import DockerSize from './docker-size.service.js'
import { sizeDataNoTagSemVerSort } from './docker-fixtures.js'

describe('DockerSize', function () {
  test(DockerSize.prototype.getSizeFromImageByLatestDate, () => {
    given(
      {
        count: 0,
        results: [],
      },
      'amd64',
    ).expectError('Not Found: repository not found')
    given(
      {
        count: 1,
        results: [
          {
            full_size: 300000000,
            name: 'next',
            images: [{ architecture: 'amd64', size: 219939484 }],
          },
        ],
      },
      'amd64',
    ).expect({
      size: 219939484,
    })
    given({
      count: 1,
      results: [
        {
          full_size: 300000000,
          name: 'next',
          images: [
            { architecture: 'amd64', size: 219939484 },
            { architecture: 'arm64', size: 200000000 },
          ],
        },
      ],
    }).expect({
      size: 300000000,
    })
    given(
      {
        count: 1,
        results: [
          {
            full_size: 300000000,
            name: 'next',
            images: [
              { architecture: 'amd64', size: 219939484 },
              { architecture: 'arm64', size: 200000000 },
            ],
          },
        ],
      },
      'arm64777',
    ).expectError('Not Found: architecture not found')
  })

  test(DockerSize.prototype.getSizeFromTag, () => {
    given(
      {
        full_size: 300000000,
        name: 'next',
        images: [{ architecture: 'amd64', size: 219939484 }],
      },
      'amd64',
    ).expect({
      size: 219939484,
    })
    given({
      full_size: 300000000,
      name: 'next',
      images: [{ architecture: 'amd64', size: 219939484 }],
    }).expect({
      size: 300000000,
    })
    given(
      {
        full_size: 300000000,
        name: 'next',
        images: [{ architecture: 'amd64', size: 219939484 }],
      },
      'arm64777',
    ).expectError('Not Found: architecture not found')
  })

  test(DockerSize.prototype.getSizeFromImageByLatestSemver, () => {
    given(sizeDataNoTagSemVerSort, 'amd64').expect({
      size: 220000000,
    })
    given(sizeDataNoTagSemVerSort).expect({
      size: 400000000,
    })
    given(sizeDataNoTagSemVerSort, 'nonexistentArch').expectError(
      'Not Found: architecture not found',
    )
  })
})
