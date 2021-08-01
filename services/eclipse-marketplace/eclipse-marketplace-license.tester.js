import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('license').get('/notepad4e.json').expectBadge({
  label: 'license',
  message: 'EPL 2.0',
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
  .expectBadge({
    label: 'license',
    message: 'not specified',
  })

t.create('license for unknown solution')
  .get('/this-does-not-exist.json')
  .expectBadge({
    label: 'license',
    message: 'solution not found',
  })
