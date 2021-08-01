import path from 'path'
import { fileURLToPath } from 'url'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { loadServiceClasses, InvalidService } from './loader.js'
chai.use(chaiAsPromised)

const { expect } = chai
const fixturesDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'loader-test-fixtures'
)

describe('loadServiceClasses function', function () {
  it('throws if module exports empty', async function () {
    await expect(
      loadServiceClasses([path.join(fixturesDir, 'empty-undefined.fixture.js')])
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([path.join(fixturesDir, 'empty-array.fixture.js')])
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([path.join(fixturesDir, 'empty-object.fixture.js')])
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([path.join(fixturesDir, 'empty-no-export.fixture.js')])
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([
        path.join(fixturesDir, 'valid-array.fixture.js'),
        path.join(fixturesDir, 'valid-class.fixture.js'),
        path.join(fixturesDir, 'empty-array.fixture.js'),
      ])
    ).to.be.rejectedWith(InvalidService)
  })

  it('throws if module exports invalid', async function () {
    await expect(
      loadServiceClasses([path.join(fixturesDir, 'invalid-no-base.fixture.js')])
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([
        path.join(fixturesDir, 'invalid-wrong-base.fixture.js'),
      ])
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([path.join(fixturesDir, 'invalid-mixed.fixture.js')])
    ).to.be.rejectedWith(InvalidService)
    await expect(
      loadServiceClasses([
        path.join(fixturesDir, 'valid-array.fixture.js'),
        path.join(fixturesDir, 'valid-class.fixture.js'),
        path.join(fixturesDir, 'invalid-no-base.fixture.js'),
      ])
    ).to.be.rejectedWith(InvalidService)
  })

  it('registers services if module exports valid service classes', async function () {
    await expect(
      loadServiceClasses([
        path.join(fixturesDir, 'valid-array.fixture.js'),
        path.join(fixturesDir, 'valid-object.fixture.js'),
        path.join(fixturesDir, 'valid-class.fixture.js'),
      ])
    ).to.eventually.have.length(5)
  })
})
