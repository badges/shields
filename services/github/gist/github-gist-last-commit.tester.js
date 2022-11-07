import { createServiceTester } from '../../tester.js'
export const t = await createServiceTester()

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
