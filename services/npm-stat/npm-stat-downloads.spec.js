import { test, given } from 'sazerac'
import NpmStatDownloads from './npm-stat-downloads.service.js'

describe('NpmStatDownloads helpers', function () {
  test(NpmStatDownloads.getTotalDownloads, () => {
    given({
      'hexo-theme-candelas': {
        '2022-12-01': 1,
        '2022-12-02': 2,
        '2022-12-03': 3,
      },
      '@dukeluo/fanjs': {
        '2022-12-01': 10,
        '2022-12-02': 20,
        '2022-12-03': 30,
      },
      'eslint-plugin-check-file': {
        '2022-12-01': 100,
        '2022-12-02': 200,
        '2022-12-03': 300,
      },
    }).expect(666)
    given({}).expect(0)
  })
})
