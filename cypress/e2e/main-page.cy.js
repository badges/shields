import { registerCommand } from 'cypress-wait-for-stable-dom'

registerCommand()

describe('Frontend', function () {
  const backendUrl = Cypress.env('backend_url')
  const SEARCH_INPUT = 'input[placeholder="Search"]'

  function visitAndWait(page) {
    cy.visit(page)
    cy.waitForStableDOM({ pollInterval: 1000, timeout: 10000 })
  }

  it('Search for badges', function () {
    visitAndWait('/')

    cy.get(SEARCH_INPUT).type('pypi')

    cy.contains('PyPI - License')
  })

  it('Shows badges from category', function () {
    visitAndWait('/badges')

    cy.contains('Build')
    cy.contains('Chat').click()

    cy.contains('Discourse Status')
    cy.contains('Stack Exchange questions')
  })

  it('Shows expected code examples', function () {
    visitAndWait('/badges/static-badge')

    cy.contains('button', 'URL').should('have.class', 'api-code-tab')
    cy.contains('button', 'Markdown').should('have.class', 'api-code-tab')
    cy.contains('button', 'rSt').should('have.class', 'api-code-tab')
    cy.contains('button', 'AsciiDoc').should('have.class', 'api-code-tab')
    cy.contains('button', 'HTML').should('have.class', 'api-code-tab')
  })

  it('Build a badge', function () {
    visitAndWait('/badges/git-hub-license')

    cy.contains('/github/license/:user/:repo')

    cy.get('input[placeholder="user"]').type('badges')
    cy.get('input[placeholder="repo"]').type('shields')

    cy.intercept('GET', `${backendUrl}/github/license/badges/shields`).as('get')
    cy.contains('Execute').click()
    cy.wait('@get').its('response.statusCode').should('eq', 200)
    cy.get('img[id="badge-preview"]')
  })
})
