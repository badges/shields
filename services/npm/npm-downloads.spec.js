'use strict'

const { test, given } = require('sazerac')
const NpmDownloads = require('./npm-downloads.service')

describe('NpmDownloads', function () {
  test(NpmDownloads._intervalMap.dt.transform, () => {
    given({
      downloads: [
        { downloads: 2, day: '2018-01-01' },
        { downloads: 3, day: '2018-01-02' },
      ],
    }).expect(5)
  })

  test(NpmDownloads.render, () => {
    given({
      interval: 'dt',
      downloadCount: 0,
    }).expect({
      message: '0',
      color: 'red',
    })
  })
})
