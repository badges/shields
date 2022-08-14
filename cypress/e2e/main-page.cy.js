describe('Main page', function () {
  const backendUrl = Cypress.env('backend_url')
  const SEARCH_INPUT = 'input[placeholder="search"]'

  function expectBadgeExample(title, previewUrl, pattern) {
    cy.contains('tr', `${title}:`).find('code').should('have.text', pattern)
    cy.contains('tr', `${title}:`)
      .find('img')
      .should('have.attr', 'src', previewUrl)
  }

  it('Search for badges', function () {
    cy.visit('/')

    cy.get(SEARCH_INPUT).type('pypi')

    cy.contains('PyPI - License')
  })

  it('Shows badge from category', function () {
    cy.visit('/category/chat')

    expectBadgeExample(
      'Discourse status',
      'http://localhost:8080/badge/discourse-online-brightgreen',
      '/discourse/status?server=https%3A%2F%2Fmeta.discourse.org'
    )
  })

  it('Customizate badges', function () {
    cy.visit('/')

    cy.get(SEARCH_INPUT).type('issues')

    cy.contains('/github/issues/:user/:repo').click()

    cy.get('input[name="user"]').type('badges')
    cy.get('input[name="repo"]').type('shields')
    cy.get('table input[name="color"]').type('orange')

    cy.get(`img[src='${backendUrl}/github/issues/badges/shields?color=orange']`)
  })

  it('Do not duplicate example parameters', function () {
    cy.visit('/category/funding')

    cy.contains('GitHub Sponsors').click()
    cy.get('[name="style"]').should($style => {
      expect($style).to.have.length(1)
    })
  })
})
