import { dependencies } from '../../package.json'

describe('Logo picker', { scrollBehavior: 'center' }, function () {
  const baseUrl = `https://cdn.jsdelivr.net/npm/simple-icons@${dependencies['simple-icons']}`
  const catalogUrl = `${baseUrl}/data/simple-icons.json`
  const picker = 'input[role="combobox"][aria-label="Logo"]'
  const icons = [
    { title: 'GitHub', slug: 'github' },
    { title: 'Node.js', slug: 'nodedotjs' },
    ...Array.from({ length: 60 }, (_, i) => ({
      title: `Test ${i}`,
      slug: `test${i}`,
    })),
  ]

  beforeEach(function () {
    cy.intercept(`${baseUrl}/icons/*.svg`, {
      headers: { 'content-type': 'image/svg+xml' },
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
    })
  })

  function visit() {
    cy.visit('/badges/static-badge')
    cy.contains('button', 'Show optional parameters').click()
    cy.get(picker).should('be.visible')
  }

  it('loads on interaction, searches names and slugs, and updates the badge URL', function () {
    cy.intercept(catalogUrl, { body: icons }).as('catalog')
    visit()
    cy.get('@catalog.all').should('have.length', 0)
    cy.get(picker).click()
    cy.wait('@catalog')
    cy.get('[role="option"]').should('have.length.lessThan', 20)
    cy.contains('button', 'Show more icons').should('not.exist')
    cy.get(picker).type('Node.js')
    cy.get('[role="option"]').should('have.length', 1)
    cy.contains('[role="option"]', 'Node.js').click()
    cy.get(picker).should('have.value', 'nodedotjs')
    cy.get(picker).should('have.attr', 'aria-expanded', 'false')
    cy.contains('code', 'logo=nodedotjs')
    cy.get(picker).clear()
    cy.get(picker).type('github{downarrow}{enter}')
    cy.get(picker).should('have.value', 'github')
    cy.contains('code', 'logo=github')
    cy.get(picker).clear()
    cy.get(picker).type('missing-icon')
    cy.contains('No matching icons')
    cy.get(picker).clear()
    cy.get(picker).type('{esc}')
    cy.get(picker).should('have.attr', 'aria-expanded', 'false')
    cy.get('code').should('not.contain.text', 'logo=')
    cy.get('@catalog.all').should('have.length', 1)
  })

  it('keeps manual input available after a CDN error and retries', function () {
    let requests = 0
    cy.intercept(catalogUrl, request => {
      requests += 1
      request.reply(requests === 1 ? { statusCode: 503 } : { body: icons })
    }).as('catalog')
    visit()
    cy.get(picker).type('github')
    cy.wait('@catalog')
    cy.contains('Could not load icons')
    cy.contains('code', 'logo=github')
    cy.contains('button', 'Retry').click()
    cy.wait('@catalog')
    cy.contains('[role="option"]', 'GitHub').click()
    cy.get(picker).should('have.value', 'github')
  })

  it('scrolls through a large catalog while keeping only a small window mounted', function () {
    cy.viewport(1280, 1000)
    const catalog = Array.from({ length: 3500 }, (_, i) => ({
      title: `Icon ${i}`,
      slug: `icon${i}`,
    }))
    cy.intercept(catalogUrl, { body: catalog }).as('catalog')
    visit()
    cy.get(picker).click()
    cy.wait('@catalog')
    cy.get('[role="option"]').should('have.length.lessThan', 20)
    cy.get('[role="listbox"]').scrollTo('bottom')
    cy.contains('[role="option"]', 'icon3499').should('be.visible')
    cy.get('[role="option"]').should('have.length.lessThan', 20)
    cy.get('[role="option"][aria-posinset="1"]').should('not.exist')
    cy.get(picker).should('have.attr', 'aria-expanded', 'true')
    cy.contains('[role="option"]', 'icon3499').click()
    cy.get(picker).should('have.value', 'icon3499')
    cy.contains('code', 'logo=icon3499')

    cy.get(picker).clear()
    cy.get('[role="listbox"]').scrollTo('bottom')
    cy.get(picker).type('Icon 12')
    cy.get('[role="listbox"]').should('have.prop', 'scrollTop', 0)
    cy.get('[role="option"]').first().should('contain.text', 'icon12')
    cy.get(picker).clear()
    cy.get(picker).type('{downarrow}'.repeat(60))
    cy.get('[role="option"][aria-selected="true"]')
      .should('contain.text', 'icon59')
      .should('be.visible')
    cy.get('[role="option"]').should('have.length.lessThan', 20)
    cy.get(picker).type('{enter}')
    cy.get(picker).should('have.value', 'icon59')
    cy.get(picker).click()
    cy.get('[role="option"]').first().should('contain.text', 'icon59')
    cy.get(picker).blur()
    cy.get(picker).should('have.attr', 'aria-expanded', 'false')
  })

  it('accepts the complete pinned catalog, including slugs with underscores', function () {
    cy.readFile('node_modules/simple-icons/data/simple-icons.json').then(
      catalog => {
        cy.intercept(catalogUrl, { body: catalog }).as('catalog')
        visit()
        cy.get(picker).click()
        cy.wait('@catalog')
        cy.get('[role="status"]').should(
          'contain.text',
          `${catalog.length} icons`,
        )
        cy.get(picker).type('Backstage')
        cy.contains('[role="option"]', 'backstage_casting')
          .find('img')
          .should('have.attr', 'src', `${baseUrl}/icons/backstage_casting.svg`)
        cy.contains('[role="option"]', 'backstage_casting').click()
        cy.get(picker).should('have.value', 'backstage_casting')
        cy.contains('code', 'logo=backstage_casting')
      },
    )
  })
})
