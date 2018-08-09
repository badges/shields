'use strict'

const { test, given } = require('sazerac')
const servicesForTitle = require('./services-for-title')

describe('Services from PR title', function() {
  test(servicesForTitle, () => {
    given('[Travis] Fix timeout issues').expect(['travis'])
    given('[Travis Sonar] Support user token authentication').expect([
      'travis',
      'sonar',
    ])
    given('[CRAN CPAN CTAN] Add test coverage').expect(['cran', 'cpan', 'ctan'])
    given(
      '[RFC] Add Joi-based request validation to BaseJsonService and rewrite [NPM] badges'
    ).expect(['npm'])
    given('make changes to [CRAN] and [CPAN]').expect(['cran', 'cpan'])
  })
})
