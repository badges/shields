'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'f-droid',
  title: 'F-Droid',
}))

const testString = `
Categories:System
License:MIT
Web Site:https://github.com/axxapy/apkExtractor/blob/HEAD/README.md
Source Code:https://github.com/axxapy/apkExtractor
Issue Tracker:https://github.com/axxapy/apkExtractor/issues

Auto Name:Apk Extractor
Summary:Get APK files from installed apps
Description:
Extract APKs from your device, even if installed from the Playstore. Root access
is required for paid apps.

* Fast and easy to use.
* Extracts almost all applications, includes system applications.
* ROOT access only required for extracting paid apps.
* Apks will be saved in /sdcard/Download/Eimon/.
* Provided Search option to search applications.
* Compatible with latest version of Android 6.0
* Saved apk format : AppPackageName.apk.
Current Version:1.8

Repo Type:git
Repo:https://github.com/axxapy/apkExtractor

Build:1.0,1
    commit=9b3b62c3ceda74b17eaa22c9e4f893aac10c4442
    gradle=yes

Build:1.1,2
    commit=1.1
    gradle=yes

Build:1.2,3
    disable=lintVitalRelease fails
    commit=1.2
    gradle=yes

Build:1.3,4
    commit=1.3
    gradle=yes

Build:1.4,5
    commit=1.4
    gradle=yes

Auto Update Mode:Version %v
Update Check Mode:Tags
Current Version:1.4
Current Version Code:5
`
const testYmlString = `
Categories: System
License: MIT
WebSite: https://github.com/axxapy/apkExtractor/blob/HEAD/README.md
SourceCode: https://github.com/axxapy/apkExtractor
IssueTracker: https://github.com/axxapy/apkExtractor/issues

AutoName: Apk Extractor
Summary: Get APK files from installed apps
Description: |-
    Extract APKs from your device, even if installed from the Playstore. Root access
    is required for paid apps.

    * Fast and easy to use.
    * Extracts almost all applications, includes system applications.
    * ROOT access only required for extracting paid apps.
    * Apk's will be saved in /sdcard/Download/Eimon/.
    * Provided Search option to search applications.
    * Compatible with latest version of Android 6.0
    * Saved apk format : AppPackageName.apk.

RepoType: git
Repo: https://github.com/axxapy/apkExtractor

Builds:
  - versionName: '1.2'
    versionCode: 32
    commit: '0.32'
    subdir: app
    gradle:
      - yes

  - versionName: '1.4'
    versionCode: 33
    commit: '5'
    subdir: app
    gradle:
      - yes

AutoUpdateMode: Version %v
UpdateCheckMode: Tags
CurrentVersion: 1.4
CurrentVersionCode: 33
`
const base = 'https://gitlab.com'
const path = '/fdroid/fdroiddata/raw/master/metadata/axp.tool.apkextractor'

t.create('Package is found with default metadata format')
  .get('/v/axp.tool.apkextractor.json')
  .intercept(nock =>
    nock(base)
      .get(`${path}.txt`)
      .reply(200, testString)
  )
  .expectJSON({ name: 'f-droid', value: 'v1.4' })

t.create('Package is found with fallback yml matadata format')
  .get('/v/axp.tool.apkextractor.json')
  .intercept(nock =>
    nock(base)
      .get(`${path}.txt`)
      .reply(404)
  )
  .intercept(nock =>
    nock(base)
      .get(`${path}.yml`)
      .reply(200, testYmlString)
  )
  .expectJSON({ name: 'f-droid', value: 'v1.4' })

t.create('Package is found with yml matadata format')
  .get('/v/axp.tool.apkextractor.json?metadata_format=yml')
  .intercept(nock =>
    nock(base)
      .get(`${path}.yml`)
      .reply(200, testYmlString)
  )
  .expectJSON({ name: 'f-droid', value: 'v1.4' })

t.create('Package is not found with "metadata_format" query parameter')
  .get('/v/axp.tool.apkextractor.json?metadata_format=yml')
  .intercept(nock =>
    nock(base)
      .get(`${path}.yml`)
      .reply(404)
  )
  .expectJSON({ name: 'f-droid', value: 'app not found' })

t.create('Package is found yml matadata format with missing "CurrentVersion"')
  .get('/v/axp.tool.apkextractor.json?metadata_format=yml')
  .intercept(nock =>
    nock(base)
      .get(`${path}.yml`)
      .reply(200, 'Categories: System')
  )
  .expectJSON({ name: 'f-droid', value: 'invalid response data' })

t.create('Package is found with bad yml matadata format')
  .get('/v/axp.tool.apkextractor.json?metadata_format=yml')
  .intercept(nock =>
    nock(base)
      .get(`${path}.yml`)
      .reply(200, '.CurrentVersion: 1.4')
  )
  .expectJSON({ name: 'f-droid', value: 'invalid response data' })

t.create('Package is not found')
  .get('/v/axp.tool.apkextractor.json')
  .intercept(nock =>
    nock(base)
      .get(`${path}.txt`)
      .reply(404)
  )
  .intercept(nock =>
    nock(base)
      .get(`${path}.yml`)
      .reply(404)
  )
  .expectJSON({ name: 'f-droid', value: 'app not found' })

t.create('The api changed')
  .get('/v/axp.tool.apkextractor.json?metadata_format=yml')
  .intercept(nock =>
    nock(base)
      .get(`${path}.yml`)
      .reply(200, '')
  )
  .expectJSON({ name: 'f-droid', value: 'invalid response data' })

t.create('Package is not found due invalid metadata format')
  .get('/v/axp.tool.apkextractor.json?metadata_format=xml')
  .expectJSON({
    name: 'f-droid',
    value: 'invalid query parameter: metadata_format',
  })

/* If this test fails, either the API has changed or the app was deleted. */
t.create('The real api did not change')
  .get('/v/org.thosp.yourlocalweather.json')
  .timeout(10000)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'f-droid',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )
