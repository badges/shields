'use strict'

const { test, given } = require('sazerac')
const RepologyRepositories = require('./repology-repositories.service')

describe('Repology repositories count badge', function() {
  test(RepologyRepositories.render, () => {
    given({ repositoryCount: 0 }).expect({ message: 0, color: 'blue' })
    given({ repositoryCount: 18 }).expect({ message: 18, color: 'blue' })
  })
})
