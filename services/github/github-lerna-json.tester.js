import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Lerna version').get('/facebook/jest.json').expectBadge({
  label: 'lerna',
  message: isSemver,
})

t.create('Lerna version (independent)')
  .get('/jneander/jneander.json')
  .expectBadge({
    label: 'lerna',
    message: 'independent',
  })

t.create('Lerna version (branch)').get('/facebook/jest/main.json').expectBadge({
  label: 'lerna@main',
  message: isSemver,
})

t.create('Lerna version (lerna.json missing)')
  .get('/PyvesB/empty-repo.json')
  .expectBadge({
    label: 'lerna',
    message: 'repo not found, branch not found, or lerna.json missing',
  })
