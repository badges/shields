import dayjs from 'dayjs'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('last commit in gist (recent)')
  .get('/7e188c35fd5ca754c970e3a1caf045ef.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/gists/7e188c35fd5ca754c970e3a1caf045ef')
      .reply(200, {
        updated_at: dayjs(),
      })
  )
  .expectBadge({ label: 'last commit', message: 'today', color: 'brightgreen' })

t.create('last commit in gist (ancient)').get('/871064.json').expectBadge({
  label: 'last commit',
  message: 'september 2015',
  color: 'red',
})

// not checking the color badge, since in August 2022 it is orange but later it will become red
t.create('last commit in gist (still ancient but slightly less so)')
  .get('/870071abadfd66a28bf539677332f12b.json')
  .expectBadge({
    label: 'last commit',
    message: 'october 2020',
  })

t.create('last commit in gist (gist not found)')
  .get('/55555555555555.json')
  .expectBadge({
    label: 'last commit',
    message: 'gist not found',
    color: 'red',
  })
