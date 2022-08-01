// import dayjs from 'dayjs'
// import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// const mockLatestCommitOnGist = () => nock =>
//   nock('https://api.github.com')
//     .get('/gists/870071abadfd66a28bf539677332f12b')
//     .reply(200)

// // intercepting the call to test the label for a gist with a recent commit
// t.create('last commit in gist (recent)')
//   .get('/gists/870071abadfd66a28bf539677332f12b')
//   .intercept(
//     mockLatestCommitOnGist({
//       updated_at: dayjs(),
//     })
//   )
//   .expectBadge({ label: 'last commit', message: 'today' })

t.create('last commit in gist (ancient)')
  .get('/871064')
  // .inspectRequest()
  .expectBadge({ label: 'last commit', message: 'september 2015' })

// t.create('last commit in gist (gist not found)')
//   .get('/gists/55555555555555')
//   .expectBadge({ label: 'last commit', message: 'gist not found' })
