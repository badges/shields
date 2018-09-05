'use strict'

const createServiceTester = require('../create-service-tester')

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = createServiceTester()
module.exports = t

t.create('Invalid AppToken or AppId')
.get('hockeyapp/v/1234/1234.json')
.expectJSONTypes({ name: 'hockeyapp', value: 'invalid'})

t.create('Android App')
.get('hockeyapp/v/15011995/30071996.json')
.intercept(nock =>
    nock('https://rink.hockeyapp.net')
      .get(
        '/api/2/apps/30071996/app_versions'
      )
      .reply(200, {
        app_versions: [
            { 
                version: '24',
                shortversion: '1.0',
            }
        ]
      }))
.expectJSONTypes({ name: 'hockeyapp', value: isVPlusDottedVersionAtLeastOne})

t.create('iOS App')
.get('hockeyapp/v/15011995/30071996.json')
.intercept(nock =>
    nock('https://rink.hockeyapp.net')
      .get(
        '/api/2/apps/30071996/app_versions'
      )
      .reply(200, {
        app_versions: [
            { 
                version: '1.0.24',
                shortversion: '1.0',
            }
        ]
      }))
.expectJSONTypes({ name: 'hockeyapp', value: isVPlusDottedVersionAtLeastOne})
