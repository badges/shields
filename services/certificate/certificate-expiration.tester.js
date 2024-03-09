import Joi from 'joi'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'certificate-expiration',
  title: 'Certificate Expiration',
  pathPrefix: '/certificate/expiration',
})

t.create('Certificate Expiration: good, any color')
  .get('/letsencrypt.org.json')
  .expectBadge({
    label: 'letsencrypt.org',
    message: Joi.string().regex(/\d{4}-\d{2}-\d{2}/),
  })

t.create('Certificate Expiration: good, green')
  .get('/shields.io.json?warningDays=0&dangerDays=0')
  .expectBadge({
    label: 'shields.io',
    color: 'green',
    message: Joi.string().regex(/\d{4}-\d{2}-\d{2}/),
  })

t.create('Certificate Expiration: good, yellow')
  .get('/shields.io.json?warningDays=365&dangerDays=0')
  .expectBadge({
    label: 'shields.io',
    color: 'yellow',
    message: Joi.string().regex(/\d{4}-\d{2}-\d{2}/),
  })

t.create('Certificate Expiration: good, red')
  .get('/shields.io.json?dangerDays=365')
  .expectBadge({
    label: 'shields.io',
    color: 'red',
    message: Joi.string().regex(/\d{4}-\d{2}-\d{2}/),
  })

// remote redirect to https://www.cloudflare.com/
t.create(
  'Certificate Expiration: good, any color, redirected to different host',
)
  .get('/cloudflare.com.json')
  .expectBadge({
    label: 'cloudflare.com',
    message: Joi.string().regex(/\d{4}-\d{2}-\d{2}/),
  })

// local redirect to /en/
t.create('Certificate Expiration: good, any color, redirected to same host')
  .get('/www.worldbank.org.json')
  .expectBadge({
    label: 'www.worldbank.org',
    message: Joi.string().regex(/\d{4}-\d{2}-\d{2}/),
  })

// NOTE: test hostnames are from https://badssl.com/dashboard/

t.create('Certificate Expiration: actually expired')
  .get('/expired.badssl.com.json')
  .expectBadge({ label: 'expired.badssl.com', color: 'red' })

t.create('Certificate Expiration: mismatch')
  .get('/wrong.host.badssl.com.json')
  .expectBadge({ label: 'wrong.host.badssl.com', color: 'red' })
