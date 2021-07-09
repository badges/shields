import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import moment from 'moment'

const dateFormat = 'YYYY-MM-DD'

const templates = {
  packageJsonVersionsTemplate: fs.readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      `packageJsonVersionsTemplate.json`
    ),
    'utf-8'
  ),
  packageJsonTemplate: fs.readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      `packageJsonTemplate.json`
    ),
    'utf-8'
  ),
}

const getTemplate = template => JSON.parse(templates[template])

const mockPackageData =
  ({ packageName, engines, scope, tag }) =>
  nock => {
    let packageJson
    let urlPath
    if (scope || tag) {
      if (scope) {
        urlPath = `/${scope}%2F${packageName}`
      } else {
        urlPath = `/${packageName}`
      }
      packageJson = getTemplate('packageJsonVersionsTemplate')
      packageJson['dist-tags'][tag || 'latest'] = '0.0.91'
      packageJson.versions['0.0.91'].engines.node = engines
    } else {
      urlPath = `/${packageName}/latest`
      packageJson = getTemplate('packageJsonTemplate')
      packageJson.engines.node = engines
    }
    return nock('https://registry.npmjs.org/')
      .get(urlPath)
      .reply(200, packageJson)
  }

const mockCurrentSha = latestVersion => nock => {
  const latestSha = `node-v${latestVersion}.12.0-aix-ppc64.tar.gz`
  return nock('https://nodejs.org/dist/')
    .get(`/latest/SHASUMS256.txt`)
    .reply(200, latestSha)
}

const mockVersionsSha = () => nock => {
  let scope = nock('https://nodejs.org/dist/')
  for (const version of [10, 12]) {
    const latestSha = `node-v${version}.12.0-aix-ppc64.tar.gz`
    scope = scope
      .get(`/latest-v${version}.x/SHASUMS256.txt`)
      .reply(200, latestSha)
  }
  return scope
}

const mockReleaseSchedule = () => nock => {
  const currentDate = moment()
  const schedule = {
    'v0.10': {
      start: '2013-03-11',
      end: '2016-10-31',
    },
    'v0.12': {
      start: '2015-02-06',
      end: '2016-12-31',
    },
    v4: {
      start: '2015-09-08',
      lts: '2015-10-12',
      maintenance: '2017-04-01',
      end: '2018-04-30',
      codename: 'Argon',
    },
    v5: {
      start: '2015-10-29',
      maintenance: '2016-04-30',
      end: '2016-06-30',
    },
    v6: {
      start: '2016-04-26',
      lts: '2016-10-18',
      maintenance: '2018-04-30',
      end: '2019-04-30',
      codename: 'Boron',
    },
    v7: {
      start: '2016-10-25',
      maintenance: '2017-04-30',
      end: '2017-06-30',
    },
    v8: {
      start: '2017-05-30',
      lts: '2017-10-31',
      maintenance: '2019-01-01',
      end: '2019-12-31',
      codename: 'Carbon',
    },
    v9: {
      start: '2017-10-01',
      maintenance: '2018-04-01',
      end: '2018-06-30',
    },
    v10: {
      start: '2018-04-24',
      lts: currentDate.clone().subtract(6, 'month').format(dateFormat),
      maintenance: '2020-04-30',
      end: currentDate.clone().add(1, 'month').format(dateFormat),
      codename: 'Dubnium',
    },
    v11: {
      start: '2018-10-23',
      maintenance: '2019-04-22',
      end: '2019-06-01',
    },
    v12: {
      start: '2019-04-23',
      lts: currentDate.clone().subtract(1, 'month').format(dateFormat),
      maintenance: '2020-10-20',
      end: currentDate.clone().add(6, 'month').format(dateFormat),
      codename: 'Erbium',
    },
    v13: {
      start: '2019-10-22',
      maintenance: '2020-04-01',
      end: '2020-06-01',
    },
    v14: {
      start: '2020-04-21',
      lts: currentDate.clone().add(4, 'month').format(dateFormat),
      maintenance: '2021-10-19',
      end: currentDate.clone().add(12, 'month').format(dateFormat),
      codename: '',
    },
  }
  return nock('https://raw.githubusercontent.com/')
    .get(`/nodejs/Release/master/schedule.json`)
    .reply(200, schedule)
}

export { mockPackageData, mockCurrentSha, mockVersionsSha, mockReleaseSchedule }
