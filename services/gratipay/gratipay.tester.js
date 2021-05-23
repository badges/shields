import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('Receiving').get('/Gratipay.json').expectBadge({
  label: 'gratipay',
  message: 'no longer available',
})
