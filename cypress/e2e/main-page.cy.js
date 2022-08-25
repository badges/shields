import { registerCommand } from 'cypress-wait-for-stable-dom'

registerCommand()

describe('Main page', function () {
  const backendUrl = Cypress.env('backend_url')
  const SEARCH_INPUT = 'input[placeholder="search / project URL"]'

  function expectBadgeExample(title, previewUrl, pattern) {
    cy.contains('tr', `${title}:`).find('code').should('have.text', pattern)
    cy.contains('tr', `${title}:`)
      .find('img')
      .should('have.attr', 'src', previewUrl)
  }

  function visitAndWait(page) {
    cy.visit(page)
    cy.waitForStableDOM({ pollInterval: 1000, timeout: 10000 })
  }

  it('Search for badges', function () {
    visitAndWait('/')

    cy.get(SEARCH_INPUT).type('pypi')

    cy.contains('PyPI - License')
  })

  it('Shows badge from category', function () {
    visitAndWait('/category/chat')

    expectBadgeExample(
      'Discourse status',
      'http://localhost:8080/badge/discourse-online-brightgreen',
      '/discourse/status?server=https%3A%2F%2Fmeta.discourse.org'
    )
  })

  it('Suggest badges', function () {
    const badgeUrl = `${backendUrl}/github/issues/badges/shields`
    visitAndWait('/')

    cy.get(SEARCH_INPUT).type('https://github.com/badges/shields')
    cy.contains('Suggest badges').click()

    expectBadgeExample('GitHub issues', badgeUrl, badgeUrl)
  })

  it('Customization form is filled with suggested badge details', function () {
    const badgeUrl = `${backendUrl}/github/issues/badges/shields`
    visitAndWait('/')
    cy.get(SEARCH_INPUT).type('https://github.com/badges/shields')
    cy.contains('Suggest badges').click()

    cy.contains(badgeUrl).click()

    cy.get('input[name="user"]').should('have.value', 'badges')
    cy.get('input[name="repo"]').should('have.value', 'shields')
  })

  it('Customizate suggested badge', function () {
    const badgeUrl = `${backendUrl}/github/issues/badges/shields`
    visitAndWait('/')
    cy.get(SEARCH_INPUT).type('https://github.com/badges/shields')
    cy.contains('Suggest badges').click()
    cy.contains(badgeUrl).click()

    cy.get('table input[name="color"]').type('orange')

    cy.get(`img[src='${backendUrl}/github/issues/badges/shields?color=orange']`)
  })

  it('Do not duplicate example parameters', function () {
    visitAndWait('/category/funding')

    cy.contains('GitHub Sponsors').click()
    cy.get('[name="style"]').should($style => {
      expect($style).to.have.length(1)
    })
  })
})
