import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'sensiolabs',
  title: 'SensioLabs',
})

t.create('sensiolabs insight')
  .get('/i/a92cacf2-ba32-4f36-b040-5a9f1d7f8f25.svg')
  .expectRedirect('/symfony/i/grade/a92cacf2-ba32-4f36-b040-5a9f1d7f8f25.svg')
