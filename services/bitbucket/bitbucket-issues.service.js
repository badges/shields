import { retiredService } from '../index.js'

export const BitbucketRawIssues = retiredService({
  name: 'BitbucketIssuesRaw',
  category: 'issue-tracking',
  route: {
    base: 'bitbucket/issues-raw',
    pattern: ':user/:repo',
  },
  label: 'issues',
  dateAdded: new Date('2026-09-13'),
})

export const BitbucketNonRawIssues = retiredService({
  name: 'BitbucketIssues',
  category: 'issue-tracking',
  route: {
    base: 'bitbucket/issues',
    pattern: ':user/:repo',
  },
  label: 'issues',
  dateAdded: new Date('2026-09-13'),
})
