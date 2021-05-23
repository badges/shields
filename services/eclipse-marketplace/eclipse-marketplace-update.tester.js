import {isFormattedDate} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('last update date').get('/notepad4e.json').expectBadge({
  label: 'updated',
  message: isFormattedDate,
})

t.create('last update for unknown solution')
  .get('/this-does-not-exist.json')
  .expectBadge({
    label: 'updated',
    message: 'solution not found',
  })
