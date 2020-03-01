'use strict'

const { ServiceTester } = require('../tester')
const { semverRange } = require('../validators')

const t = (module.exports = new ServiceTester({
  id: 'GithubPackageLockJson',
  title: 'GithubPackageLockJson',
  pathPrefix: '/github/package-lock-json',
}))

t.create('Dependency version')
  .get('/dependency-version/paulmelnikow/react-boxplot/react.json')
  .expectBadge({
    label: 'react',
    message: semverRange,
  })

t.create('Dependency version - Custom label')
  .get(
    '/dependency-version/paulmelnikow/react-boxplot/react.json?label=react%20tested'
  )
  .expectBadge({
    label: 'react tested',
    message: semverRange,
  })

t.create('Dependency version')
  .get('/dependency-version/paulmelnikow/react-boxplot/simple-statistics.json')
  .expectBadge({
    label: 'simple-statistics',
    message: semverRange,
  })

t.create('Dependency version (monorepo)')
  .get(
    `/dependency-version/OriginProtocol/origin/davidshimjs-qrcodejs.json?filename=${encodeURIComponent(
      'dapps/marketplace/package-lock.json'
    )}`
  )
  .expectBadge({
    label: 'davidshimjs-qrcodejs',
    message: semverRange,
  })

t.create('Scoped dependency')
  .get('/dependency-version/badges/shields/@babel/core.json')
  .expectBadge({
    label: '@babel/core',
    message: semverRange,
  })

t.create('Scoped dependency on branch')
  .get('/dependency-version/badges/shields/@babel/core/master.json')
  .expectBadge({
    label: '@babel/core',
    message: semverRange,
  })

t.create('Unknown dependency')
  .get('/dependency-version/paulmelnikow/react-boxplot/i-made-this-up.json')
  .expectBadge({
    label: 'locked dependency',
    message: 'dependency not found',
  })
