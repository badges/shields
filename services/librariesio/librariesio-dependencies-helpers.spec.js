'use strict'

const { test, given, forCases } = require('sazerac')
const {
  renderDependenciesBadge,
} = require('./librariesio-dependencies-helpers')

describe('Libraries.io dependency helpers', function () {
  test(renderDependenciesBadge, () => {
    forCases([
      given({ deprecatedCount: 10, outdatedCount: 0 }),
      given({ deprecatedCount: 10, outdatedCount: 5 }),
    ]).expect({
      message: '10 deprecated',
      color: 'red',
    })
    given({ deprecatedCount: 0, outdatedCount: 5 }).expect({
      message: '5 out of date',
      color: 'orange',
    })
    given({ deprecatedCount: 0, outdatedCount: 0 }).expect({
      message: 'up to date',
      color: 'brightgreen',
    })
  })
})
