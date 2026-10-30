import { expect } from 'chai'
import nock from 'nock'
import {
  prepareRoute,
  namedParamsForMatch,
} from '../../core/base-service/route.js'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import LibrariesIoDependents from './librariesio-dependents.service.js'
import LibrariesIoDependentRepos from './librariesio-dependent-repos.service.js'
import LibrariesIoSourcerank from './librariesio-sourcerank.service.js'
import LibrariesIoApiProvider from './librariesio-api-provider.js'
import librariesIoDependenciesServices from './librariesio-dependencies.service.js'

const [LibrariesIoProjectDependencies] = librariesIoDependenciesServices

function matchRoute(ServiceClass, path) {
  const { regex, captureNames } = prepareRoute(ServiceClass.route)
  const match = regex.exec(`/${ServiceClass.route.base}/${path}`)
  if (!match) {
    return null
  }
  return namedParamsForMatch(captureNames, match, ServiceClass)
}

describe('Libraries.io project routes', function () {
  for (const ServiceClass of [
    LibrariesIoDependents,
    LibrariesIoDependentRepos,
    LibrariesIoSourcerank,
  ]) {
    describe(ServiceClass.name, function () {
      it('matches an unscoped package', function () {
        expect(matchRoute(ServiceClass, 'npm/got.svg')).to.deep.equal({
          platform: 'npm',
          scope: undefined,
          packageName: 'got',
        })
      })

      it('matches a scoped npm package', function () {
        expect(matchRoute(ServiceClass, 'npm/@babel/core.svg')).to.deep.equal({
          platform: 'npm',
          scope: '@babel',
          packageName: 'core',
        })
      })

      it('matches a package name containing slashes', function () {
        expect(
          matchRoute(ServiceClass, 'go/github.com/ipfs/kubo.svg'),
        ).to.deep.equal({
          platform: 'go',
          scope: undefined,
          packageName: 'github.com/ipfs/kubo',
        })
      })
    })
  }
})

describe('LibrariesIoDependents', function () {
  cleanUpNockAfterEach()

  it('requests a package name containing slashes', async function () {
    const librariesIoApiProvider = new LibrariesIoApiProvider({
      baseUrl: 'https://libraries.io/api',
    })
    const scope = nock('https://libraries.io/api')
      .get('/go/github.com%2Fipfs%2Fkubo')
      .reply(200, {
        platform: 'Go',
        dependents_count: 199,
        dependent_repos_count: 143,
        rank: 20,
      })

    expect(
      await LibrariesIoDependents.invoke(
        { ...defaultContext, librariesIoApiProvider },
        {},
        { platform: 'go', packageName: 'github.com/ipfs/kubo' },
      ),
    ).to.deep.equal({
      message: '199',
      color: 'brightgreen',
    })

    scope.done()
  })
})

describe('LibrariesIoProjectDependencies', function () {
  describe('route', function () {
    const cases = [
      ['npm/got.svg', undefined, 'got'],
      ['hex/phoenix/1.0.3.svg', undefined, 'phoenix/1.0.3'],
      ['npm/@babel/core.svg', '@babel', 'core'],
      ['npm/@babel/core/7.0.0-rc.0.svg', '@babel', 'core/7.0.0-rc.0'],
      ['go/github.com/ipfs/kubo.svg', undefined, 'github.com/ipfs/kubo'],
      [
        'go/github.com/ipfs/kubo/v0.30.0.svg',
        undefined,
        'github.com/ipfs/kubo/v0.30.0',
      ],
    ]
    for (const [path, scope, packageNameAndVersion] of cases) {
      it(`matches ${path}`, function () {
        expect(matchRoute(LibrariesIoProjectDependencies, path)).to.deep.equal({
          platform: path.split('/')[0],
          scope,
          packageNameAndVersion,
        })
      })
    }
  })

  describe('splitPackageNameAndVersion', function () {
    const cases = [
      ['got', 'got', 'latest'],
      ['Newtonsoft.Json', 'Newtonsoft.Json', 'latest'],
      ['phoenix/1.0.3', 'phoenix', '1.0.3'],
      ['phoenix/latest', 'phoenix', 'latest'],
      ['core/7.0.0-rc.0', 'core', '7.0.0-rc.0'],
      ['github.com/ipfs/kubo', 'github.com/ipfs/kubo', 'latest'],
      ['github.com/ipfs/kubo/v0.30.0', 'github.com/ipfs/kubo', 'v0.30.0'],
      ['github.com/ipfs/kubo/0.30.0', 'github.com/ipfs/kubo', '0.30.0'],
      [
        'github.com/go-chi/chi/v5/v5.0.12',
        'github.com/go-chi/chi/v5',
        'v5.0.12',
      ],
      // A major version suffix on its own is indistinguishable from a version
      ['github.com/go-chi/chi/v5', 'github.com/go-chi/chi', 'v5'],
    ]
    for (const [input, packageName, version] of cases) {
      it(`splits ${input}`, function () {
        expect(
          LibrariesIoProjectDependencies.splitPackageNameAndVersion(input),
        ).to.deep.equal({ packageName, version })
      })
    }
  })

  describe('request', function () {
    cleanUpNockAfterEach()

    const librariesIoApiProvider = new LibrariesIoApiProvider({
      baseUrl: 'https://libraries.io/api',
    })
    const cases = [
      [
        { platform: 'go', packageNameAndVersion: 'github.com/ipfs/kubo' },
        '/go/github.com%2Fipfs%2Fkubo/latest/dependencies',
      ],
      [
        {
          platform: 'go',
          packageNameAndVersion: 'github.com/ipfs/kubo/v0.30.0',
        },
        '/go/github.com%2Fipfs%2Fkubo/v0.30.0/dependencies',
      ],
      [
        { platform: 'npm', scope: '@babel', packageNameAndVersion: 'core' },
        '/npm/%40babel%2Fcore/latest/dependencies',
      ],
      [
        {
          platform: 'npm',
          scope: '@babel',
          packageNameAndVersion: 'core/7.0.0',
        },
        '/npm/%40babel%2Fcore/7.0.0/dependencies',
      ],
      [
        { platform: 'hex', packageNameAndVersion: 'phoenix/1.0.3' },
        '/hex/phoenix/1.0.3/dependencies',
      ],
    ]
    for (const [namedParams, expectedPath] of cases) {
      it(`requests ${expectedPath}`, async function () {
        const scope = nock('https://libraries.io/api')
          .get(expectedPath)
          .reply(200, {
            dependencies: [
              { deprecated: false, outdated: false },
              { deprecated: false, outdated: true },
            ],
          })

        expect(
          await LibrariesIoProjectDependencies.invoke(
            { ...defaultContext, librariesIoApiProvider },
            {},
            namedParams,
          ),
        ).to.deep.equal({ message: '1 out of date', color: 'orange' })

        scope.done()
      })
    }
  })
})
