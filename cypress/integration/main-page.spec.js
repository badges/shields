'use strict'

describe('Main page', function() {
  const backendUrl = Cypress.env('backend_url')
  const SEARCH_INPUT = 'input[placeholder="search / project URL"]'

  it('Search for badges', function() {
    cy.visit('/')

    cy.get(SEARCH_INPUT).type('pypi')

    cy.contains('PyPI - License')
  })

  it('Suggest badges', function() {
    const badgeUrl = `${backendUrl}/github/issues/badges/shields.svg?link=https%3A%2F%2Fgithub.com%2Fbadges%2Fshields%2Fissues`
    cy.visit('/')

    cy.get(SEARCH_INPUT).type('https://github.com/badges/shields')
    cy.contains('Suggest badges').click()

    cy.contains('GitHub issues')
    cy.get(`img[src='${badgeUrl}']`)
    cy.contains(badgeUrl)
  })

  it('Customization form is filled with suggested badge details', function() {
    const badgeUrl = `${backendUrl}/github/issues/badges/shields.svg`
    cy.visit('/')
    cy.get(SEARCH_INPUT).type('https://github.com/badges/shields')
    cy.contains('Suggest badges').click()

    cy.contains(badgeUrl).click()

    cy.get('input[name="user"]').should('have.value', 'badges')
    cy.get('input[name="repo"]').should('have.value', 'shields')
  })

  it('Customizate suggested badge', function() {
    const badgeUrl = `${backendUrl}/github/issues/badges/shields.svg`
    cy.visit('/')
    cy.get(SEARCH_INPUT).type('https://github.com/badges/shields')
    cy.contains('Suggest badges').click()
    cy.contains(badgeUrl).click()

    cy.get('table input[name="color"]').type('orange')

    cy.get(
      `img[src='${backendUrl}/github/issues/badges/shields.svg?color=orange&link=https%3A%2F%2Fgithub.com%2Fbadges%2Fshields%2Fissues']`
    )
  })
})
