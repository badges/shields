import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isUbuntuVersion = Joi.string().regex(
  /^v(\d+:)?\d+(\.\d+)*([\w\\.]*)?([-+~].*)?$/
)

t.create('Ubuntu package (default distribution, valid)')
  .get('/apt.json')
  .expectBadge({
    label: 'ubuntu',
    message: isUbuntuVersion,
  })

t.create('Ubuntu package (valid)')
  .get('/ubuntu-wallpapers/bionic.json')
  .intercept(nock =>
    nock('https://api.launchpad.net')
      .get(
        '/1.0/ubuntu/+archive/primary?ws.op=getPublishedSources&exact_match=true&order_by_date=true&status=Published&source_name=ubuntu-wallpapers&distro_series=https%3A%2F%2Fapi.launchpad.net%2F1.0%2Fubuntu%2Fbionic'
      )
      .reply(200, {
        entries: [
          {
            source_package_name: 'ubuntu-wallpapers',
            source_package_version: '18.04.1-0ubuntu1',
          },
        ],
      })
  )
  .expectBadge({ label: 'ubuntu', message: 'v18.04.1-0ubuntu1' })

t.create('Ubuntu package (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'ubuntu', message: 'not found' })

t.create('Ubuntu package (series not found)')
  .get('/apt/not-a-series.json')
  .expectBadge({ label: 'ubuntu', message: 'series not found' })
