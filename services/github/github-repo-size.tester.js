import {isFileSize} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('repository size').get('/badges/shields.json').expectBadge({
  label: 'repo size',
  message: isFileSize,
})

t.create('repository size (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({
    label: 'repo size',
    message: 'repo not found',
  })
