import { expect } from 'chai'
import librariesIoDependenciesServices from './librariesio-dependencies.service.js'

const [LibrariesIoProjectDependencies] = librariesIoDependenciesServices

describe('LibrariesIoProjectDependencies', function () {
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
})
