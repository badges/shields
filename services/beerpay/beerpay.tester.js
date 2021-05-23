import {withRegex} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

const amountOfMoney = withRegex(/^\$[0-9]+(\.[0-9]+)?/)

t.create('funding').get('/hashdog/scrapfy-chrome-extension.json').expectBadge({
  label: 'beerpay',
  message: amountOfMoney,
})

t.create('funding (unknown project)')
  .get('/hashdog/not-a-real-project.json')
  .expectBadge({
    label: 'beerpay',
    message: 'project not found',
  })
