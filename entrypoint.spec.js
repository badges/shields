'use strict'

const { expect } = require('chai')
const isSvg = require('is-svg')
const got = require('./core/got-test-client')

let server
before(() => {
  this.timeout('5s')
  // remove args comming from mocha
  // https://github.com/badges/shields/issues/3365
  process.argv = []
  server = require('./server')
})

after('shut down the server', async () => {
  await server.stop()
})

it('should render a badge', async () => {
  const { statusCode, body } = await got(
    'http://localhost:1111/badge/fruit-apple-green.svg'
  )
  expect(statusCode).to.equal(200)
  expect(body)
    .to.satisfy(isSvg)
    .and.to.include('fruit')
    .and.to.include('apple')
})
