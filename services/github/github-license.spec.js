'use strict'

const { test, given } = require('sazerac')
const GithubLicense = require('./github-license.service')

test(GithubLicense.render, () => {
  given({ license: undefined }).expect({ message: 'not specified' })
  given({ license: 'NOASSERTION' }).expect({
    message: 'not identifiable by github',
  })
  given({ license: 'MIT' }).expect({ message: 'MIT', color: 'green' })
})
