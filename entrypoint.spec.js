import { expect } from 'chai'
import isSvg from 'is-svg'
import got from './core/got-test-client.js'

let serverModule
before(async function () {
  this.timeout('30s')
  // remove args coming from mocha
  // https://github.com/badges/shields/issues/3365
  process.argv = []
  serverModule = await import('./server.js')
})

after('shut down the server', async function () {
  await serverModule.server.stop()
})

it('should render a badge', async function () {
  this.timeout('30s')
  const { statusCode, body } = await got(
    'http://localhost:1111/badge/fruit-apple-green.svg'
  )
  expect(statusCode).to.equal(200)
  expect(body).to.satisfy(isSvg).and.to.include('fruit').and.to.include('apple')
})
