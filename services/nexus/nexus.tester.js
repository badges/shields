import { isVPlusDottedVersionNClausesWithOptionalSuffix as isVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('search release version valid artifact')
  .get('/r/me.neznamy/tab-api.json?server=https://repo.tomkeuper.com')
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('search release version of an nonexistent artifact')
  .get(
    '/r/me.neznamy/nonexistent-artifact-id.json?server=https://repo.tomkeuper.com',
  )
  .expectBadge({
    label: 'nexus',
    message: 'artifact or version not found',
  })

t.create('search snapshot version valid snapshot artifact')
  .get(
    '/s/io.github.beefdev.uuidswitcher/common.json?server=https://repo.codemc.io',
  )
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('search snapshot version for artifact without snapshots')
  .get('/s/com.tomkeuper/spigot.json?server=https://repo.tomkeuper.com')
  .expectBadge({
    label: 'nexus',
    message: 'artifact or snapshot version not found',
    color: 'red',
  })

t.create('repository version')
  .get(
    '/bedwars-releases/me.neznamy/tab-api.json?server=https://repo.tomkeuper.com',
  )
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('repository version with query')
  .get(
    `/bedwars-releases/me.neznamy/tab-api.json?server=https://repo.tomkeuper.com&queryOpt=${encodeURIComponent(
      ':maven.extension=jar:direction=asc',
    )}`,
  )
  .expectBadge({
    label: 'nexus',
    message: isVersion,
  })

t.create('search release version without snapshots')
  .get(
    // Limit the version from above, so that any later artifacts don't break this test.
    `/r/net.pistonmaster/pistonmotd-bukkit.json?server=https://repo.codemc.io&queryOpt=${encodeURIComponent(
      ':maven.baseVersion=<5.1.1',
    )}`,
  )
  .expectBadge({
    label: 'nexus',
    message: 'v5.1.0',
  })
