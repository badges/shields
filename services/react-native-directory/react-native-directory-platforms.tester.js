import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('supported platforms of react-native-reanimated')
  .get('/react-native-reanimated.json')
  .expectBadge({
    label: 'platforms',
    message:
      'Android | iOS | Web | macOS | tvOS | visionOS | Expo Go | Fire OS | Harmony | VegaOS',
  })

t.create('supported platforms of @react-native-menu/menu')
  .get('/@react-native-menu/menu.json')
  .expectBadge({ label: 'platforms', message: 'Android | iOS | visionOS' })

t.create('package not found').get('/not-a-package.json').expectBadge({
  label: 'platforms',
  message: 'package not found',
})
