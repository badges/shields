import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'visualstudiomarketplace',
  title: 'Visual Studio Marketplace (deprecated)',
  pathPrefix: '/visual-studio-marketplace',
})

export const tLegacy = new ServiceTester({
  id: 'visualstudiomarketplacelegacy',
  title: 'VSCode Marketplace (deprecated)',
  pathPrefix: '/vscode-marketplace',
})

// Downloads / Installs (visual-studio-marketplace)
t.create('no longer available (visual-studio-marketplace downloads)')
  .get('/d/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

t.create('no longer available (visual-studio-marketplace installs)')
  .get('/i/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

// Downloads / Installs (vscode-marketplace - legacy)
tLegacy
  .create('no longer available (vscode-marketplace downloads)')
  .get('/d/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

tLegacy
  .create('no longer available (vscode-marketplace installs)')
  .get('/i/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

// Version (visual-studio-marketplace)
t.create('no longer available (version)')
  .get('/v/lextudio.restructuredtext.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

// Version (vscode-marketplace - legacy)
tLegacy
  .create('no longer available (version legacy)')
  .get('/v/lextudio.restructuredtext.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

// Rating / Stars (visual-studio-marketplace)
t.create('no longer available (rating)')
  .get('/r/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

t.create('no longer available (stars)')
  .get('/stars/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

// Rating / Stars (vscode-marketplace - legacy)
tLegacy
  .create('no longer available (rating legacy)')
  .get('/r/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

tLegacy
  .create('no longer available (stars legacy)')
  .get('/stars/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

// Release date / Last updated (visual-studio-marketplace)
t.create('no longer available (release date)')
  .get('/release-date/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

t.create('no longer available (last updated)')
  .get('/last-updated/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

// Release date / Last updated (vscode-marketplace - legacy)
tLegacy
  .create('no longer available (release date legacy)')
  .get('/release-date/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

tLegacy
  .create('no longer available (last updated legacy)')
  .get('/last-updated/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

// Azure DevOps installs (visual-studio-marketplace)
t.create('no longer available (azure devops installs total)')
  .get('/azure-devops/installs/total/swellaby.mirror-git-repository.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })
