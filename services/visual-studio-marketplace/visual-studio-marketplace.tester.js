import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'visualstudiomarketplace',
  title: 'Visual Studio Marketplace (retired)',
  pathPrefix: '/visual-studio-marketplace',
})

export const tLegacy = new ServiceTester({
  id: 'visualstudiomarketplacelegacy',
  title: 'VSCode Marketplace (retired)',
  pathPrefix: '/vscode-marketplace',
})

// Downloads / Installs (visual-studio-marketplace)
t.create('retired badge (visual-studio-marketplace downloads)')
  .get('/d/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

t.create('retired badge (visual-studio-marketplace installs)')
  .get('/i/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

// Downloads / Installs (vscode-marketplace - legacy)
tLegacy
  .create('retired badge (vscode-marketplace downloads)')
  .get('/d/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

tLegacy
  .create('retired badge (vscode-marketplace installs)')
  .get('/i/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

// Version (visual-studio-marketplace)
t.create('retired badge (version)')
  .get('/v/lextudio.restructuredtext.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

// Version (vscode-marketplace - legacy)
tLegacy
  .create('retired badge (version legacy)')
  .get('/v/lextudio.restructuredtext.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

// Rating / Stars (visual-studio-marketplace)
t.create('retired badge (rating)')
  .get('/r/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

t.create('retired badge (stars)')
  .get('/stars/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

// Rating / Stars (vscode-marketplace - legacy)
tLegacy
  .create('retired badge (rating legacy)')
  .get('/r/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

tLegacy
  .create('retired badge (stars legacy)')
  .get('/stars/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

// Release date / Last updated (visual-studio-marketplace)
t.create('retired badge (release date)')
  .get('/release-date/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

t.create('retired badge (last updated)')
  .get('/last-updated/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

// Release date / Last updated (vscode-marketplace - legacy)
tLegacy
  .create('retired badge (release date legacy)')
  .get('/release-date/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

tLegacy
  .create('retired badge (last updated legacy)')
  .get('/last-updated/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })

// Azure DevOps installs (visual-studio-marketplace)
t.create('retired badge (azure devops installs total)')
  .get('/azure-devops/installs/total/swellaby.mirror-git-repository.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'retired badge',
  })
