import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('last commit (recent)')
  .get('/eslint/eslint.json')
  .expectBadge({ label: 'last commit', message: isFormattedDate })

t.create('last commit (ancient)')
  .get('/badges/badgr.co.json')
  .expectBadge({ label: 'last commit', message: 'january 2014' })

t.create('last commit (on branch)')
  .get('/badges/badgr.co/shielded.json')
  .expectBadge({ label: 'last commit', message: 'july 2013' })

t.create('last commit (by top-level file path)')
  .get('/badges/badgr.co.json?path=README.md')
  .expectBadge({ label: 'last commit', message: 'september 2013' })

t.create('last commit (by top-level dir path)')
  .get('/badges/badgr.co.json?path=badgr')
  .expectBadge({ label: 'last commit', message: 'june 2013' })

t.create('last commit (by top-level dir path with trailing slash)')
  .get('/badges/badgr.co.json?path=badgr/')
  .expectBadge({ label: 'last commit', message: 'june 2013' })

t.create('last commit (by nested file path)')
  .get('/badges/badgr.co.json?path=badgr/colors.py')
  .expectBadge({ label: 'last commit', message: 'june 2013' })

t.create('last commit (on branch) (by top-level file path)')
  .get('/badges/badgr.co/shielded.json?path=README.md')
  .expectBadge({ label: 'last commit', message: 'june 2013' })

t.create('last commit (by committer)')
  .get('/badges/badgr.co/shielded.json?display_timestamp=committer')
  .expectBadge({ label: 'last commit', message: 'july 2013' })

t.create('last commit (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({ label: 'last commit', message: 'repo not found' })

t.create('last commit (no commits found)')
  .get('/badges/badgr.co/shielded.json?path=not/a/dir')
  .expectBadge({ label: 'last commit', message: 'no commits found' })
