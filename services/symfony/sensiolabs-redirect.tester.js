import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'sensiolabs',
  title: 'SensioLabs',
})

t.create('sensiolabs insight')
  .get('/i/825be328-29f8-44f7-a750-f82818ae9111.svg')
  .expectRedirect('/symfony/i/grade/825be328-29f8-44f7-a750-f82818ae9111.svg')
