import { test, given } from 'sazerac'
import NpmDownloads from './npm-downloads.service.js'

describe('NpmDownloads', function () {
  test(NpmDownloads._intervalMap.d18m.transform, () => {
    given({
      downloads: [
        { downloads: 2, day: '2018-01-01' },
        { downloads: 3, day: '2018-01-02' },
      ],
    }).expect(5)
  })

  test(NpmDownloads.render, () => {
    given({
      interval: 'd18m',
      downloadCount: 0,
    }).expect({
      color: 'red',
      message: '0',
      label: undefined,
    })
  })
})
