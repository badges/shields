import {ServiceTester} from '../tester.js';

export const t = new ServiceTester({
  id: 'gratipay',
  title: 'Gratipay',
})

t.create('Receiving').get('/Gratipay.json').expectBadge({
  label: 'gratipay',
  message: 'no longer available',
})
