import {isMetric} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('Followers').get('/webcaetano.json').expectBadge({
  label: 'followers',
  message: isMetric,
  color: 'blue',
})

t.create('Followers (user not found)').get('/PyvesB2.json').expectBadge({
  label: 'followers',
  message: 'user not found',
})
