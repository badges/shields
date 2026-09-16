import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'whatpulse',
  title: 'WhatPulse',
})

t.create('retired badge (previously keys)')
  .get('/keys/user/179734.json')
  .expectBadge({
    label: 'whatpulse',
    message: 'retired badge',
  })

t.create('retired badge (previously clicks)')
  .get('/clicks/team/1295.json')
  .expectBadge({
    label: 'whatpulse',
    message: 'retired badge',
  })

t.create('retired badge (previously uptime)')
  .get('/uptime/user/179734.json')
  .expectBadge({
    label: 'whatpulse',
    message: 'retired badge',
  })

t.create('retired badge (previously download)')
  .get('/download/team/1295.json')
  .expectBadge({
    label: 'whatpulse',
    message: 'retired badge',
  })

t.create('retired badge (previously upload)')
  .get('/upload/team/1295.json')
  .expectBadge({
    label: 'whatpulse',
    message: 'retired badge',
  })
