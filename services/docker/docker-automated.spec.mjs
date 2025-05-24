import { createServiceTester } from '../tester.js'

// Validator for 'automated' or 'manual' message
const isAutomatedOrManual = /^(automated|manual)$/

export const t = await createServiceTester()

t.create('docker automated build (automated)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({ label: 'docker build', message: isAutomatedOrManual })
