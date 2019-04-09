'use strict'

describe('Main page', function() {
  it('Search for badges', function() {
    cy.visit('/')

    cy.get('input[placeholder="search / project URL"]').type('pypi')

    cy.contains('PyPI - License')
  })

  it('Suggest badges', function() {
    cy.visit('/')

    cy.get('input[placeholder="search / project URL"]').type(
      'https://github.com/badges/shields'
    )
    cy.contains('Suggest badges').click()

    cy.contains('/github/issues/badges/shields.svg')
  })
})
