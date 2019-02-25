'use strict'

const { test, given } = require('sazerac')
const Luarocks = require('./luarocks.service')

test(Luarocks.render, () => {
  given({ version: 'dev-1' }).expect({ message: 'dev-1', color: 'yellow' })
  given({ version: 'scm-1' }).expect({ message: 'scm-1', color: 'orange' })
  given({ version: 'cvs-1' }).expect({ message: 'cvs-1', color: 'orange' })
  given({ version: '0.1-1' }).expect({
    message: 'v0.1-1',
    color: 'brightgreen',
  })
})
