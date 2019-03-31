'use strict'

describe('Main page', function() {
  it('Search for badges', function() {
    cy.visit('http://localhost:3000')

    cy.get('input[placeholder="search / project URL"]').type('pypi')

    cy.contains('tr', 'pypi')
  })
})
