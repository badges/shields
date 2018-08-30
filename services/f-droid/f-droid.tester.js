'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const ServiceTester = require('../service-tester')
const t = new ServiceTester({ id: 'f-droid', title: 'F-Droid' })
const Joi = require('joi')
module.exports = t

const testString =
  'Categories:System\n' +
  'License:MIT\n' +
  'Web Site:https://github.com/axxapy/apkExtractor/blob/HEAD/README.md\n' +
  'Source Code:https://github.com/axxapy/apkExtractor\n' +
  'Issue Tracker:https://github.com/axxapy/apkExtractor/issues\n' +
  '\n' +
  'Auto Name:Apk Extractor\n' +
  'Summary:Get APK files from installed apps\n' +
  'Description:\n' +
  'Extract APKs from your device, even if installed from the Playstore. Root access\n' +
  'is required for paid apps.\n' +
  '\n' +
  '* Fast and easy to use.\n' +
  '* Extracts almost all applications, includes system applications.\n' +
  '* ROOT access only required for extracting paid apps.\n' +
  "* Apk's will be saved in /sdcard/Download/Eimon/.\n" +
  '* Provided Search option to search applications.\n' +
  '* Compatible with latest version of Android 6.0\n' +
  '* Saved apk format : AppPackageName.apk.\n' +
  'Current Version:1.8\n' +
  '.\n' +
  '\n' +
  'Repo Type:git\n' +
  'Repo:https://github.com/axxapy/apkExtractor\n' +
  '\n' +
  'Build:1.0,1\n' +
  '    commit=9b3b62c3ceda74b17eaa22c9e4f893aac10c4442\n' +
  '    gradle=yes\n' +
  '\n' +
  'Build:1.1,2\n' +
  '    commit=1.1\n' +
  '    gradle=yes\n' +
  '\n' +
  'Build:1.2,3\n' +
  '    disable=lintVitalRelease fails\n' +
  '    commit=1.2\n' +
  '    gradle=yes\n' +
  '\n' +
  'Build:1.3,4\n' +
  '    commit=1.3\n' +
  '    gradle=yes\n' +
  '\n' +
  'Build:1.4,5\n' +
  '    commit=1.4\n' +
  '    gradle=yes\n' +
  '\n' +
  'Auto Update Mode:Version %v\n' +
  'Update Check Mode:Tags\n' +
  'Current Version:1.4\n' +
  'Current Version Code:5\n'
const base = 'https://gitlab.com'
const path = '/fdroid/fdroiddata/raw/master/metadata/axp.tool.apkextractor.txt'

t.create('Package is found')
  .get('/v/axp.tool.apkextractor.json')
  .intercept(nock =>
    nock(base)
      .get(path)
      .reply(200, testString)
  )
  .expectJSON({ name: 'f-droid', value: 'v1.4' })

t.create('Package is not found')
  .get('/v/axp.tool.apkextractor.json')
  .intercept(nock =>
    nock(base)
      .get(path)
      .reply(404, testString)
  )
  .expectJSON({ name: 'f-droid', value: 'app not found' })

t.create('The api changed')
  .get('/v/axp.tool.apkextractor.json')
  .intercept(nock =>
    nock(base)
      .get(path)
      .reply(200, '')
  )
  .expectJSON({ name: 'f-droid', value: 'invalid response' })

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
