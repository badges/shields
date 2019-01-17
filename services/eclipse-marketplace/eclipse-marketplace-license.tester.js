'use strict'

const t = (module.exports = require('../create-service-tester')())

t.create('license')
  .get('/notepad4e.json')
  .expectJSON({
    name: 'license',
    value: 'GPL',
  })

t.create('unspecified license')
  .get('/notepad4e.json')
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
  .get('/this-does-not-exist.json')
  .expectJSON({
    name: 'license',
    value: 'solution not found',
  })
