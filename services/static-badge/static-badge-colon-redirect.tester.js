import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('static badge colon redirect: basic redirect')
  .get('/:label-message-blue')
  .expectRedirect('/badge/label-message-blue.svg')

t.create('static badge colon redirect: with spaces and dash encoding')
  .get('/:all%20one%20color-red')
  .expectRedirect('/badge/all%20one%20color-red.svg')

t.create('static badge colon redirect: double dash and underscore encoding')
  .get('/:best--license-Apache--2.0-blue')
  .expectRedirect('/badge/best--license-Apache--2.0-blue.svg')

t.create('static badge colon redirect: missing label')
  .get('/:-message-blue')
  .expectRedirect('/badge/-message-blue.svg')

t.create('static badge colon redirect: missing message')
  .get('/:label--blue')
  .expectRedirect('/badge/label--blue.svg')
