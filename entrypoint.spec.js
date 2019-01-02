'use strict'

const { expect } = require('chai')
const fetch = require('node-fetch')
const isSvg = require('is-svg')
const serverConfig = require('./lib/server-config')

let server
before(function() {
  this.timeout('5s')
  serverConfig.bind = {
    port: 1111,
    address: 'localhost',
  }
  server = require('./server')
})

after('shut down the server', async function() {
  await server.stop()
})

it('should render a badge', async function() {
  const res = await fetch('http://localhost:1111/badge/fruit-apple-green.svg')
  expect(res.ok).to.be.true
  expect(await res.text())
    .to.satisfy(isSvg)
    .and.to.include('fruit')
    .and.to.include('apple')
})
