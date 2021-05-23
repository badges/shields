import {isMetric} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('Forks')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'forks',
    message: isMetric,
    color: 'blue',
    link: [
      'https://github.com/badges/shields/fork',
      'https://github.com/badges/shields/network',
    ],
  })

t.create('Forks (repo not found)').get('/badges/helmets.json').expectBadge({
  label: 'forks',
  message: 'repo not found',
})
