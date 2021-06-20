// Usage:
//
// Run all services:
//   npm run test:services
//
// Run some services:
//   npm run test:services -- --only=service1,service2,service3
//
// Alternatively, pass a newline-separated list of services to stdin.
//   echo "service1\nservice2\nservice3" | npm run test:services -- --stdin
//
// Run tests but skip tests which intercept requests:
//   SKIP_INTERCEPTED=TRUE npm run test:services --
//
// Run tests on a given instance:
//   SKIP_INTERCEPTED=TRUE TESTED_SERVER_URL=https://test.shields.io npm run test:services --
//
// Run tests with given number of retries and backoff (in milliseconds):
//   RETRY_COUNT=3 RETRY_BACKOFF=100 npm run test:services --
// Retry option documentation:
// https://github.com/IcedFrisby/IcedFrisby/blob/master/API.md#retrycount-backoff
//
// Service tests are run in CI in two cases: scheduled builds and pull
// requests. The scheduled builds run _all_ the service tests, whereas the
// pull requests run service tests designated in the PR title. In this way,
// affected services can be proven working during code review without needing
// to run all the slow (and likely flaky) service tests.
//
// Example pull request titles:
//
// - [Travis] Fix timeout issues
// - [Travis Sonar] Support user token authentication
// - [CRAN CPAN CTAN] Add test coverage
//
// The pull request script test:services:pr is split into two parts. First the
// :prepare script infers the pull request context, fetches the PR title, and
// writes the list of affected services to a file. Then the :run script reads
// the list of affected services and runs the appropriate tests.
//
// There are three reasons to separate these two steps into separate processes
// and build stages:
//
// 1. Generating the list of services to test is necessarily asynchronous, and
//    in Mocha, exclusive tests (`it.only` and `describe.only`) can only be
//    applied synchronously. In other words, if you try to add exclusive tests
//    in an asynchronous callback, all the tests will run. Undoubtedly this
//    could be fixed, though it's not worth it. The problem is obscure and
//    therefore low for Mocha, which is quite backlogged. There is an easy
//    workaround, which is to generate the list of services to test in a
//    separate process.
// 2. Executing these two steps of the test runner separately makes the process
//    easier to reason about and much easier to debug on a dev machine.
// 3. Getting "pipefail" to work cross platform with an npm script seems tricky.
//    Relying on npm scripts is safer. Using "pre" makes it impossible to run
//    the second step without the first.

import minimist from 'minimist'
import envFlag from 'node-env-flag'
import readAllStdinSync from 'read-all-stdin-sync'
import { createTestServer } from '../server/in-process-server-test-helpers.js'
import Runner from './runner.js'

import('../unhandled-rejection.spec.js')

const retry = {}
retry.count = parseInt(process.env.RETRY_COUNT) || 0
retry.backoff = parseInt(process.env.RETRY_BACKOFF) || 0

const args = minimist(process.argv.slice(3))
const stdinOption = args.stdin
const onlyOption = args.only
let onlyServices
if (stdinOption && onlyOption) {
  console.error('Do not use --only with --stdin')
} else if (stdinOption) {
  const allStdin = readAllStdinSync().trim()
  onlyServices = allStdin ? allStdin.split('\n') : []
} else if (onlyOption) {
  onlyServices = onlyOption.split(',')
}

let baseUrl, server
if (process.env.TESTED_SERVER_URL) {
  baseUrl = process.env.TESTED_SERVER_URL
} else {
  const port = 1111
  baseUrl = 'http://localhost:1111'
  before('Start running the server', async function () {
    server = await createTestServer({
      public: {
        bind: {
          port,
        },
      },
    })
    await server.start()
  })
  after('Shut down the server', async function () {
    if (server) {
      await server.stop()
    }
  })
}

const skipIntercepted = envFlag(process.env.SKIP_INTERCEPTED, false)
const runner = new Runner({ baseUrl, skipIntercepted, retry })
await runner.prepare()

// The server's request cache causes side effects between tests.
if (!process.env.TESTED_SERVER_URL) {
  runner.beforeEach = () => {
    server.reset()
  }
}

if (typeof onlyServices === 'undefined' || onlyServices.includes('*****')) {
  console.info('Running all service tests.')
} else if (onlyServices.length === 0) {
  console.info('No service tests to run. Exiting.')
  process.exit(0)
} else {
  console.info(
    `Running tests for ${onlyServices.length} services: ${onlyServices.join(
      ', '
    )}.\n`
  )
  runner.only(onlyServices)
}

runner.toss()
