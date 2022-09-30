// import Joi from 'joi'
// import { createServiceTester } from '../tester.js'
// export const t = await createServiceTester()

// t.create('WhatPulse user keys')
//   .get('/tokio/0.3.0.json')
//   .expectBadge({ label: 'docs@0.3.0', message: 'passing' })

// tests to write:
// user as user id, category not from Ranks
// http://localhost:8080/whatpulse/user/179734?category=DOWNLOAD

// user as user name, category from Ranks
// http://localhost:8080/whatpulse/user/jerone?category=rankS/UplOad

// team as team id, category not from Ranks
// http://localhost:8080/whatpulse/team/1295?category=clicks

// team as team name, category from Ranks
// http://localhost:8080/whatpulse/team/dutch%20power%20cows?category=RANKS/clickS

// invalid category name
// http://localhost:8080/whatpulse/user/179734?category=DOWNLOADessss

// incorrect user name (the response from the WhatPulse's API does not contain the Joi-required fields)
// http://localhost:8080/whatpulse/user/jeroneeeeee?category=DOWNLOAD
