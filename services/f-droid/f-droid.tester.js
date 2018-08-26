'use strict'

const ServiceTester = require('../service-tester')
const t = new ServiceTester({ id: 'f-droid', title: 'F-Droid' })
module.exports = t

const manyVersions =
  '<span></span><span class="doctype">&lt;!DOCTYPE html&gt;</span><span>\n\t<ul class="package-versions-list">\n\t\t\t\n\t\t\t<li class="package-version">\n\t\t\t\t<div class="package-version-header">\n\t\t\t\t\t\n\t\t\t\t\t\n                                        <a name="0.19"></a>\n                                        <a name="19"></a>\n\t\t\t\t\t<b>Version 0.19</b> (19) - Added on 2018-08-23\n\t\t\t\t</div>\n\t\t\t\t<p class="package-version-requirement">\n\t\t\t\t\t\n\t\t\t\t\tThis version requires Android 5.0 or newer.\n\t\t\t\t</p>\n\n\t\t\t\t<p class="package-version-source">\n\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\tIt is built and signed by F-Droid, and guaranteed to correspond to <a href="https://f-droid.org/repo/org.pacien.tincapp_19_src.tar.gz">this source tarball</a>.\n\t\t\t\t\t\n\t\t\t\t</p>\n\n\t\t\t\t<p class="package-version-download">\n\t\t\t\t\t<a href="https://f-droid.org/repo/org.pacien.tincapp_19.apk">\n\t\t\t\t\t\tDownload APK\n\t\t\t\t\t</a>\n\t\t\t\t\t6.9 MiB\n\t\t\t\t\t<a href="https://f-droid.org/repo/org.pacien.tincapp_19.apk.asc">PGP Signature</a>\n\t\t\t\t</p>\n\n\t\t\t\t<div class="package-version-permissions">\n                    <details open="">\n                        <summary class="package-version-permissions-summary">\n                            Permissions\n                        </summary>\n                        <ul class="package-version-permissions-list">\n                            \n                            <li>\n                                android.permission.INTERNET\n                                \n                            </li>\n                            \n                            <li>\n                                android.permission.CAMERA\n                                \n                            </li>\n                            \n                        </ul>\n                    </details>\n\t\t\t\t</div>\n\n\t\t\t</li>\n\n\t\t\t\n\t\t\t<li class="package-version">\n\t\t\t\t<div class="package-version-header">\n\t\t\t\t\t\n\t\t\t\t\t\n                                        <a name="0.18"></a>\n                                        <a name="18"></a>\n\t\t\t\t\t<b>Version 0.18</b> (18) - Added on 2018-08-12\n\t\t\t\t</div>\n\t\t\t\t<p class="package-version-requirement">\n\t\t\t\t\t\n\t\t\t\t\tThis version requires Android 5.0 or newer.\n\t\t\t\t</p>\n\n\t\t\t\t<p class="package-version-source">\n\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\tIt is built and signed by F-Droid, and guaranteed to correspond to <a href="https://f-droid.org/repo/org.pacien.tincapp_18_src.tar.gz">this source tarball</a>.\n\t\t\t\t\t\n\t\t\t\t</p>\n\n\t\t\t\t<p class="package-version-download">\n\t\t\t\t\t<a href="https://f-droid.org/repo/org.pacien.tincapp_18.apk">\n\t\t\t\t\t\tDownload APK\n\t\t\t\t\t</a>\n\t\t\t\t\t6.7 MiB\n\t\t\t\t\t<a href="https://f-droid.org/repo/org.pacien.tincapp_18.apk.asc">PGP Signature</a>\n\t\t\t\t</p>\n\n\t\t\t\t<div class="package-version-permissions">\n                    <details>\n                        <summary class="package-version-permissions-summary">\n                            Permissions\n                        </summary>\n                        <ul class="package-version-permissions-list">\n                            \n                            <li>\n                                android.permission.INTERNET\n                                \n                            </li>\n                            \n                        </ul>\n                    </details>\n\t\t\t\t</div>\n\n\t\t\t</li>\n\n</ul></span>'

t.create('Package is found')
  .get('/version/org.pacien.tincapp.json')
  .intercept(nock =>
    nock('https://f-droid.org')
      .get('/en/packages/org.pacien.tincapp/')
      .reply(200, manyVersions)
  )
  .expectJSON({ name: 'F-Droid', value: 'v0.19' })

t.create('Package is not found')
  .get('/version/org.pacien.tincapp.json')
  .intercept(nock =>
    nock('https://f-droid.org')
      .get('/en/packages/org.pacien.tincapp/')
      .reply(404, manyVersions)
  )
  .expectJSON({ name: 'F-Droid', value: 'app not found' })

t.create('The api changed')
  .get('/version/org.pacien.tincapp.json')
  .intercept(nock =>
    nock('https://f-droid.org')
      .get('/en/packages/org.pacien.tincapp/')
      .reply(200, '')
  )
  .expectJSON({ name: 'F-Droid', value: 'fix this badge' }) // INVALID_API_RESPONSE

t.create('The real api does not change')
  .get('/version/org.pacien.tincapp.json')
  .intercept(nock =>
    nock('https://f-droid.org')
      .get('/en/packages/org.pacien.tincapp/')
      .reply(200, '')
  )
  .expectJSON.property("value").to.not.equal("fix this badge")


