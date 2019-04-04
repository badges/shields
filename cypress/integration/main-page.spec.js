'use strict'

describe('Main page', function() {
  it('Search for badges', function() {
    cy.visit('/')

    cy.get('input[placeholder="search / project URL"]').type('pypi')

    cy.contains('PyPI - License')
  })
})
