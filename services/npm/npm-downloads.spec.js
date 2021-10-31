import { test, given } from 'sazerac'
import NpmDownloads from './npm-downloads.service.js'

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
      color: 'red',
      message: '0',
      label: undefined,
    })
  })
})
