import path from 'path'
import { fileURLToPath } from 'url'
import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
  loadServiceClasses,
  getServicePaths,
  InvalidService,
} from './loader.js'
use(chaiAsPromised)

const fixturesDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'loader-test-fixtures',
)

describe('loadServiceClasses function', function () {
  it('throws if module exports empty', async function () {
    await expect(
      loadServiceClasses([
        path.join(fixturesDir, 'empty-undefined.fixture.js'),
      ]),
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([path.join(fixturesDir, 'empty-array.fixture.js')]),
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([path.join(fixturesDir, 'empty-object.fixture.js')]),
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([
        path.join(fixturesDir, 'empty-no-export.fixture.js'),
      ]),
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([
        path.join(fixturesDir, 'valid-array.fixture.js'),
        path.join(fixturesDir, 'valid-class.fixture.js'),
        path.join(fixturesDir, 'empty-array.fixture.js'),
      ]),
    ).to.be.rejectedWith(InvalidService)
  })

  it('throws if module exports invalid', async function () {
    await expect(
      loadServiceClasses([
        path.join(fixturesDir, 'invalid-no-base.fixture.js'),
      ]),
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([
        path.join(fixturesDir, 'invalid-wrong-base.fixture.js'),
      ]),
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([path.join(fixturesDir, 'invalid-mixed.fixture.js')]),
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([
        path.join(fixturesDir, 'valid-array.fixture.js'),
        path.join(fixturesDir, 'valid-class.fixture.js'),
        path.join(fixturesDir, 'invalid-no-base.fixture.js'),
      ]),
    ).to.be.rejectedWith(InvalidService)
  })

  it('registers services if module exports valid service classes', async function () {
    await expect(
      loadServiceClasses([
        path.join(fixturesDir, 'valid-array.fixture.js'),
        path.join(fixturesDir, 'valid-object.fixture.js'),
        path.join(fixturesDir, 'valid-class.fixture.js'),
      ]),
    ).to.eventually.have.length(5)
  })
})

describe('getServicePaths', function () {
  // these tests just make sure we discover a
  // plausibly large number of .service and .tester files
  it('finds a non-zero number of services in the project', function () {
    expect(getServicePaths('*.service.js')).to.have.length.above(400)
  })

  it('finds a non-zero number of testers in the project', function () {
    expect(getServicePaths('*.tester.js')).to.have.length.above(400)
  })
})
