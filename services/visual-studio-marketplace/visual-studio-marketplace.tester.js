import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'visualstudiomarketplace',
  title: 'Visual Studio Marketplace (deprecated)',
})

// Downloads / Installs
t.create('no longer available (visual-studio-marketplace downloads)')
  .get('/visual-studio-marketplace/d/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

t.create('no longer available (visual-studio-marketplace installs)')
  .get('/visual-studio-marketplace/i/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

t.create('no longer available (vscode-marketplace downloads)')
  .get('/vscode-marketplace/d/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

t.create('no longer available (vscode-marketplace installs)')
  .get('/vscode-marketplace/i/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

// Version
t.create('no longer available (version)')
  .get('/visual-studio-marketplace/v/lextudio.restructuredtext.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

t.create('no longer available (version legacy)')
  .get('/vscode-marketplace/v/lextudio.restructuredtext.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

// Rating / Stars
t.create('no longer available (rating)')
  .get('/visual-studio-marketplace/r/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

t.create('no longer available (stars)')
  .get('/visual-studio-marketplace/stars/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

t.create('no longer available (rating legacy)')
  .get('/vscode-marketplace/r/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

t.create('no longer available (stars legacy)')
  .get('/vscode-marketplace/stars/ritwickdey.LiveServer.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

// Release date / Last updated
t.create('no longer available (release date)')
  .get('/visual-studio-marketplace/release-date/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

t.create('no longer available (release date legacy)')
  .get('/vscode-marketplace/release-date/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

t.create('no longer available (last updated)')
  .get('/visual-studio-marketplace/last-updated/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

t.create('no longer available (last updated legacy)')
  .get('/vscode-marketplace/last-updated/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })

// Azure DevOps installs
t.create('no longer available (azure devops installs total)')
  .get(
    '/visual-studio-marketplace/azure-devops/installs/total/swellaby.mirror-git-repository.json',
  )
  .expectBadge({
    label: 'visual-studio-marketplace',
    message: 'no longer available',
  })
