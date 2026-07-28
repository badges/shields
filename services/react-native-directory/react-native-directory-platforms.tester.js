import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'ReactNativeDirectory',
  title: 'React Native Directory',
  pathPrefix: '/react-native-directory',
})

t.create('supported platforms')
  .intercept(nock =>
    nock('https://reactnative.directory')
      .get('/api/library')
      .query({ name: 'react-native-example' })
      .reply(200, {
        'react-native-example': {
          ios: true,
          android: true,
          web: true,
          windows: true,
          macos: true,
          tvos: true,
          visionos: true,
          expoGo: true,
          fireos: true,
          harmony: true,
          horizon: true,
          vegaos: '@vega-os/react-native-example',
        },
      }),
  )
  .get('/react-native-example.json')
  .expectBadge({
    label: 'platforms',
    message:
      'iOS, Android, Web, Windows, macOS, tvOS, visionOS, Expo Go, Fire OS, Harmony, Horizon, VegaOS',
  })

t.create('omits unsupported platforms')
  .intercept(nock =>
    nock('https://reactnative.directory')
      .get('/api/library')
      .query({ name: 'react-native-partial' })
      .reply(200, {
        'react-native-partial': {
          ios: true,
          android: true,
          web: true,
          expoGo: true,
          newArchitecture: true,
          fireos: true,
        },
      }),
  )
  .get('/react-native-partial.json')
  .expectBadge({
    label: 'platforms',
    message: 'iOS, Android, Web, Expo Go, Fire OS',
  })

t.create('no supported platforms')
  .intercept(nock =>
    nock('https://reactnative.directory')
      .get('/api/library')
      .query({ name: 'react-native-example' })
      .reply(200, {
        'react-native-example': {
          ios: false,
          android: false,
          web: false,
          windows: false,
          macos: false,
          tvos: false,
          visionos: false,
          expoGo: false,
          fireos: false,
          harmony: false,
          horizon: false,
          vegaos: false,
        },
      }),
  )
  .get('/react-native-example.json')
  .expectBadge({
    label: 'platforms',
    message: 'none',
  })

t.create('package not found')
  .intercept(nock =>
    nock('https://reactnative.directory')
      .get('/api/library')
      .query({ name: 'not-a-package' })
      .reply(200, {}),
  )
  .get('/not-a-package.json')
  .expectBadge({
    label: 'platforms',
    message: 'package not found',
  })
