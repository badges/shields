import {isFormattedDate} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('last commit (recent)')
  .get('/eslint/eslint.json')
  .expectBadge({ label: 'last commit', message: isFormattedDate })

t.create('last commit (ancient)')
  .get('/badges/badgr.co.json')
  .expectBadge({ label: 'last commit', message: 'january 2014' })

t.create('last commit (on branch)')
  .get('/badges/badgr.co/shielded.json')
  .expectBadge({ label: 'last commit', message: 'july 2013' })

t.create('last commit (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({ label: 'last commit', message: 'repo not found' })
