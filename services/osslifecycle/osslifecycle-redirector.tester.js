import queryString from 'querystring'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'osslifecycleRedirect',
  title: 'OSSLifecycleRedirect',
  pathPrefix: '/osslifecycle',
})

t.create('oss lifecycle redirect')
  .get('/netflix/osstracker.svg')
  .expectRedirect(
    `/osslifecycle.svg?${queryString.stringify({
      file_url:
        'https://raw.githubusercontent.com/netflix/osstracker/HEAD/OSSMETADATA',
    })}`,
  )

t.create('oss lifecycle redirect (branch)')
  .get('/netflix/osstracker/documentation.svg')
  .expectRedirect(
    `/osslifecycle.svg?${queryString.stringify({
      file_url:
        'https://raw.githubusercontent.com/netflix/osstracker/documentation/OSSMETADATA',
    })}`,
  )
