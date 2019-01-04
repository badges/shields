'use strict'

const ServiceTester = require('../service-tester')

const t = (module.exports = new ServiceTester({
  id: 'eclipse-marketplace-license',
  title: 'EclipseMarketplaceLicense',
  pathPrefix: '/eclipse-marketplace',
}))

t.create('license')
  .get('/l/notepad4e.json')
  .expectJSON({
    name: 'license',
    value: 'GPL',
  })

t.create('unspecified license')
  .get('/l/notepad4e.json')
  .intercept(nock =>
    nock('https://marketplace.eclipse.org')
      .get('/content/notepad4e/api/p')
      .reply(
        200,
        `<marketplace>
           <node id="3108021" name="Notepad4e" url="https://marketplace.eclipse.org/content/notepad4e">
             <license/>
           </node>
         </marketplace>`
      )
  )
  .expectJSON({
    name: 'license',
    value: 'not specified',
  })

t.create('license for unknown solution')
  .get('/l/this-does-not-exist.json')
  .expectJSON({
    name: 'license',
    value: 'solution not found',
  })
