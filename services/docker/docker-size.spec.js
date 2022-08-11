import { test, given } from 'sazerac'
import DockerSize from './docker-size.service.js'
// import { sizeDataNoTagSemVerSort } from './docker-fixtures.js'

describe('DockerSize', function () {
  test(DockerSize.prototype.noTagWithDateSortTransform, () => {
    given(
      {
        count: 0,
        results: [
          {
            full_size: 219939484,
            name: 'next',
            images: [{ architecture: 'amd64', size: 219939484 }],
          },
        ],
      },
      'amd64'
    ).expectError('Not Found: repository not found')
    given(
      {
        count: 152,
        results: [
          {
            full_size: 300000000,
            name: 'next',
            images: [{ architecture: 'amd64', size: 219939484 }],
          },
        ],
      },
      'amd64'
    ).expect({
      size: 219939484,
    })
    given({
      count: 152,
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
        count: 152,
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
      'arm64777'
    ).expectError('Not Found: architecture not found')

    // given({
    //   tag: '',
    //   sort: 'date',
    //   data: {
    //     results: [
    //       {
    //         images: [{ name: 'latest', size: 74661264 }],
    //         full_size: 74661264,
    //       },
    //       {
    //         images: [{ name: 'arm64v8-latest', size: 74661264 }],
    //         full_size: 74661264,
    //       },
    //       {
    //         images: [{ name: 'arm32v7-latest', size: 68001970 }],
    //         full_size: 68001970,
    //       },
    //       {
    //         images: [{ name: 'amd64-latest', size: 74661264 }],
    //         full_size: 74661264,
    //       },
    //     ],
    //   },
    // }).expect({
    //   size: 74661264,
    // })
    // given({
    //   tag: '',
    //   sort: 'semver',
    //   data: sizeDataNoTagSemVerSort,
    // }).expect({
    //   size: 13448411,
    // })
    // given({
    //   tag: 'latest',
    //   data: {
    //     images: [{ name: 'latest', size: 13448411 }],
    //     full_size: 74661264,
    //   },
    // }).expect({
    //   size: 13448411,
    // })
  })
})
