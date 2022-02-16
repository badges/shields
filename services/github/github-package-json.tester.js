import Joi from 'joi'
import { ServiceTester } from '../tester.js'
import { isSemver } from '../test-validators.js'
import { semverRange } from '../validators.js'

export const t = new ServiceTester({
  id: 'GithubPackageJson',
  title: 'GithubPackageJson',
  pathPrefix: '/github/package-json',
})

t.create('Package version').get('/v/badges/shields.json').expectBadge({
  label: 'version',
  message: isSemver,
})

t.create('Package version (repo not found)')
  .get('/v/badges/helmets.json')
  .expectBadge({
    label: 'version',
    message: 'repo not found, branch not found, or package.json missing',
  })

t.create('Package version (monorepo)')
  .get(
    `/v/metabolize/anafanafo.json?filename=${encodeURIComponent(
      'packages/char-width-table-builder/package.json'
    )}`
  )
  .expectBadge({
    label: 'version',
    message: isSemver,
  })

t.create('Package name')
  .get('/n/badges/shields.json')
  .expectBadge({ label: 'name', message: 'shields.io' })

t.create('Package name - Custom label')
  .get('/name/badges/shields.json?label=Dev Name')
  .expectBadge({ label: 'Dev Name', message: 'shields.io' })

t.create('Package array')
  .get('/keywords/badges/shields.json')
  .expectBadge({
    label: 'keywords',
    message: Joi.string().regex(/.*?,/),
  })

t.create('Package object')
  .get('/dependencies/badges/shields.json')
  .expectBadge({ label: 'package.json', message: 'invalid key value' })

t.create('Peer dependency version')
  .get('/dependency-version/paulmelnikow/react-boxplot/peer/react.json')
  .expectBadge({
    label: 'react',
    message: semverRange,
  })

t.create('Optional dependency version')
  .get('/dependency-version/IcedFrisby/IcedFrisby/optional/@hapi/joi.json')
  .expectBadge({
    label: '@hapi/joi',
    message: semverRange,
  })

t.create('Dev dependency version')
  .get(
    '/dependency-version/paulmelnikow/react-boxplot/dev/react.json?label=react%20tested'
  )
  .expectBadge({
    label: 'react tested',
    message: semverRange,
  })

t.create('Prod dependency version')
  .get('/dependency-version/paulmelnikow/react-boxplot/simple-statistics.json')
  .expectBadge({
    label: 'simple-statistics',
    message: semverRange,
  })

t.create('Prod dependency version (monorepo)')
  .get(
    `/dependency-version/metabolize/anafanafo/puppeteer.json?filename=${encodeURIComponent(
      'packages/char-width-table-builder/package.json'
    )}`
  )
  .expectBadge({
    label: 'puppeteer',
    message: semverRange,
  })

t.create('Scoped dependency')
  .get('/dependency-version/badges/shields/dev/@babel/core.json')
  .expectBadge({
    label: '@babel/core',
    message: semverRange,
  })

t.create('Scoped dependency on branch')
  .get('/dependency-version/zeit/next.js/dev/@babel/eslint-parser/canary.json')
  .expectBadge({
    label: '@babel/eslint-parser',
    message: semverRange,
  })

t.create('Unknown dependency')
  .get('/dependency-version/paulmelnikow/react-boxplot/dev/i-made-this-up.json')
  .expectBadge({
    label: 'dependency',
    message: 'dev dependency not found',
  })
