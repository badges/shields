'use strict'

const { loadServiceClasses } = require('../services')

const visualStudioTeamServicesDoc = `
<p>
  To obtain your own badge, you will first need to enable badges for your
  project:
</p>
<img
  src="https://cloud.githubusercontent.com/assets/6189336/11894616/be744ab4-a578-11e5-9e44-0c32a7836b3b.png"
  alt="Go to your builds, click General, then check Badge enabled." />
<p>
  Then, click “Show url…” to reveal the URL of the default badge. In that URL,
  you will need to extract three pieces of information: <code>TEAM_NAME</code>,
  <code>PROJECT_ID</code> and <code>BUILD_DEFINITION_ID</code>.
</p>
<img
  src="https://cloud.githubusercontent.com/assets/6189336/11629345/f4eb0d78-9cf7-11e5-8d83-ca9fd895fcea.png"
  alt="TEAM_NAME is just after the https:// part, PROJECT_ID is after definitions/, BUILD_DEFINITION_ID is after that.">
<p>
  Your badge will then have the form
  <code>https://img.shields.io/vso/build/TEAM_NAME/PROJECT_ID/BUILD_DEFINITION_ID</code>.
</p>
`

const websiteDoc = `
<p>
  The badge is of the form
  <code>https://img.shields.io/website[OPTIONS]/PROTOCOL/URLREST.svg</code>,
  the simplest case being
  <code>https://img.shields.io/website/http/example.com.svg</code>.
  More options are described below.
</p>
<p>
  The whole URL is obtained by concatenating the <code>PROTOCOL</code>
  (<code>http</code> or <code>https</code>, for example) with the
  <code>URLREST</code> (separating them with <code>://</code>).
</p>
<p>
  The existence of a specific path on the server can be checked by appending
  a path after the domain name, e.g.
  <code>https://img.shields.io/website/http/www.website.com/path/to/page.html.svg</code>.
</p>
<p>
  The URLREST should be URLEncoded:
  <br>
  <input type="text" id="websiteDocUrlField" placeholder="Paste your URL (without the protocol) here" /><br>
  <button onclick="(function(el) { el.value = encodeURIComponent(el.value); })(document.getElementById('websiteDocUrlField'))">Encode</button>
  <button onclick="(function(el) { el.value = decodeURIComponent(el.value); })(document.getElementById('websiteDocUrlField'))">Decode</button>
</p>
<p>
  <code>[OPTIONS]</code> can be:
  <ul>
    <li>
      Nothing:&nbsp;
      <code>…/website/…</code>
    </li>
    <li>
      Online and offline text:&nbsp;
      <code>…/website-up-down/…</code>
    </li>
    <li>
      Online and offline text, then online and offline colors:&nbsp;
      <code>…/website-up-down-green-orange/…</code></li>
    </li>
  </ul>
  <table class="centered"><tbody>
    <tr><td>   Dashes <code>--</code>
      </td><td>  →
      </td><td>  <code>-</code> Dash
    </td></tr>
    <tr><td>   Underscores <code>__</code>
      </td><td>  →
      </td><td>  <code>_</code> Underscore <br/>
    </td></tr>
    <tr><td>   Slashes <code>//</code>
      </td><td>  →
      </td><td>  <code>/</code> Slash <br/>
    </td></tr>
    <tr><td>   <code>_</code> or Space <code>&nbsp;</code>
      </td><td>  →
      </td><td>  <code>&nbsp;</code> Space
    </td></tr>
  </tbody></table>
</p>
`

const githubDoc = `
<p>
  If your GitHub badge errors, it might be because you hit GitHub's rate limits.
  <br>
  You can increase Shields.io's rate limit by
  <a href="https://img.shields.io/github-auth">going to this page</a> to add
  Shields as a GitHub application on your GitHub account.
</p>
`

const bugzillaDoc = `
<p>
  If your Bugzilla badge errors, it might be because you are trying to load a private bug.
</p>
`

const jiraSprintCompletionDoc = `
<p>
  To get the <code>Sprint ID</code>, go to your Backlog view in your project,
  right click on your sprint name and get the value of
  <code>data-sprint-id</code>.
</p>
`

const allBadgeExamples = [
  {
    category: {
      id: 'build',
      name: 'Build',
    },
    examples: [
      {
        title: 'Travis (.org)',
        previewUrl: '/travis/rust-lang/rust.svg',
        urlPattern: '/travis/:user/:repo.svg',
        exampleUrl: '/travis/rust-lang/rust.svg',
      },
      {
        title: 'Travis (.org) branch',
        previewUrl: '/travis/rust-lang/rust/master.svg',
        urlPattern: '/travis/:user/:repo/:branch.svg',
        exampleUrl: '/travis/rust-lang/rust/master.svg',
      },
      {
        title: 'Travis (.com)',
        previewUrl: '/travis/com/ivandelabeldad/rackian-gateway.svg',
        urlPattern: '/travis/com/:user/:repo.svg',
        exampleUrl: '/travis/com/ivandelabeldad/rackian-gateway.svg',
      },
      {
        title: 'Travis (.com) branch',
        previewUrl: '/travis/com/ivandelabeldad/rackian-gateway/master.svg',
        urlPattern: '/travis/com/:user/:repo/:branch.svg',
        exampleUrl: '/travis/com/ivandelabeldad/rackian-gateway/master.svg',
      },
      {
        title: 'TeamCity CodeBetter',
        previewUrl: '/teamcity/codebetter/bt428.svg',
      },
      {
        title: 'TeamCity (simple build status)',
        previewUrl: '/teamcity/http/teamcity.jetbrains.com/s/bt345.svg',
      },
      {
        title: 'TeamCity (full build status)',
        keywords: ['teamcity'],
        previewUrl: '/teamcity/http/teamcity.jetbrains.com/e/bt345.svg',
      },
      {
        title: 'Buildkite',
        previewUrl:
          '/buildkite/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489/master.svg',
      },
      {
        title: 'Codeship',
        previewUrl: '/codeship/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1.svg',
      },
      {
        title: 'Codeship',
        previewUrl: '/codeship/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1/master.svg',
      },
      {
        title: 'Visual Studio Team services',
        previewUrl:
          '/vso/build/larsbrinkhoff/953a34b9-5966-4923-a48a-c41874cfb5f5/1.svg',
        documentation: visualStudioTeamServicesDoc,
      },
      {
        title: 'Jenkins',
        previewUrl:
          '/jenkins/s/https/jenkins.qa.ubuntu.com/view/Precise/view/All%20Precise/job/precise-desktop-amd64_default.svg',
      },
      {
        title: 'Jenkins tests',
        previewUrl:
          '/jenkins/t/https/jenkins.qa.ubuntu.com/view/Precise/view/All%20Precise/job/precise-desktop-amd64_default.svg',
      },
      {
        title: 'Jenkins Coverage (Cobertura)',
        previewUrl:
          '/jenkins/c/https/jenkins.qa.ubuntu.com/view/Utopic/view/All/job/address-book-service-utopic-i386-ci.svg',
      },
      {
        title: 'Jenkins Coverage (Jacoco)',
        previewUrl:
          '/jenkins/j/https/jenkins.qa.ubuntu.com/view/Utopic/view/All/job/address-book-service-utopic-i386-ci.svg',
      },
      {
        title: 'Bitbucket Pipelines',
        previewUrl: '/bitbucket/pipelines/atlassian/adf-builder-javascript.svg',
      },
      {
        title: 'Bitbucket Pipelines branch',
        previewUrl:
          '/bitbucket/pipelines/atlassian/adf-builder-javascript/task/SECO-2168.svg',
      },
      {
        title: 'Coveralls github',
        previewUrl: '/coveralls/github/jekyll/jekyll.svg',
      },
      {
        title: 'Coveralls github branch',
        previewUrl: '/coveralls/github/jekyll/jekyll/master.svg',
      },
      {
        title: 'Coveralls bitbucket',
        previewUrl: '/coveralls/bitbucket/pyKLIP/pyklip.svg',
      },
      {
        title: 'Coveralls bitbucket branch',
        previewUrl: '/coveralls/bitbucket/pyKLIP/pyklip/master.svg',
      },
      {
        title: 'SonarQube Coverage',
        previewUrl:
          '/sonar/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/coverage.svg',
      },
      {
        title: 'SonarQube Tech Debt',
        previewUrl:
          '/sonar/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/tech_debt.svg',
      },
      {
        title: 'SonarQube Coverage (legacy API)',
        previewUrl:
          '/sonar/4.2/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/coverage.svg',
      },
      {
        title: 'SonarQube Tech Debt (legacy API)',
        previewUrl:
          '/sonar/4.2/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/tech_debt.svg',
      },
      {
        title: 'TeamCity CodeBetter Coverage',
        previewUrl: '/teamcity/coverage/bt428.svg',
      },
      {
        title: 'Scrutinizer',
        previewUrl: '/scrutinizer/g/filp/whoops.svg',
      },
      {
        title: 'Scrutinizer Coverage',
        previewUrl: '/scrutinizer/coverage/g/filp/whoops.svg',
      },
      {
        title: 'Scrutinizer branch',
        previewUrl: '/scrutinizer/coverage/g/doctrine/doctrine2/master.svg',
      },
      {
        title: 'Scrutinizer Build',
        previewUrl: '/scrutinizer/build/g/filp/whoops.svg',
      },
      {
        title: 'Codecov',
        previewUrl: '/codecov/c/github/codecov/example-python.svg',
      },
      {
        title: 'Codecov branch',
        previewUrl: '/codecov/c/github/codecov/example-python/master.svg',
      },
      {
        title: 'Codecov private',
        previewUrl: '/codecov/c/github/codecov/example-python.svg',
        urlPattern: '/codecov/c/token/:token/github/codecov/example-python.svg',
        exampleUrl:
          '/codecov/c/token/My0A8VL917/github/codecov/example-python.svg',
      },
      {
        title: 'Coverity Scan',
        previewUrl: '/coverity/scan/3997.svg',
      },
      {
        title: 'Coverity Code Advisor On Demand Stream Badge',
        previewUrl: '/coverity/ondemand/streams/STREAM.svg',
      },
      {
        title: 'Coverity Code Advisor On Demand Job Badge',
        previewUrl: '/coverity/ondemand/jobs/JOB.svg',
      },
      {
        title: 'LGTM Alerts',
        previewUrl: '/lgtm/alerts/g/apache/cloudstack.svg',
      },
      {
        title: 'LGTM Grade',
        previewUrl: '/lgtm/grade/java/g/apache/cloudstack.svg',
      },
      {
        title: 'SensioLabs Insight',
        previewUrl: '/sensiolabs/i/45afb680-d4e6-4e66-93ea-bcfa79eb8a87.svg',
      },
      {
        title: 'Dockbit',
        previewUrl:
          '/dockbit/DockbitStatus/health.svg?token=TvavttxFHJ4qhnKstDxrvBXM',
        urlPattern: '/dockbit/:organisation/:pipeline.svg?token=:token',
        exampleUrl:
          '/dockbit/DockbitStatus/health.svg?token=TvavttxFHJ4qhnKstDxrvBXM',
      },
      {
        title: 'continuousphp',
        previewUrl: '/continuousphp/git-hub/doctrine/dbal/master.svg',
      },
      {
        title: 'Read the Docs',
        previewUrl: '/readthedocs/pip.svg',
        keywords: ['documentation'],
      },
      {
        title: 'Read the Docs (version)',
        previewUrl: '/readthedocs/pip/stable.svg',
        keywords: ['documentation'],
      },
      {
        title: 'Bitrise',
        previewUrl:
          '/bitrise/cde737473028420d/master.svg?token=GCIdEzacE4GW32jLVrZb7A',
        urlPattern:
          '/bitrise/:app-id/:branch.svg?token=:app-status-badge-token',
        exampleUrl:
          '/bitrise/cde737473028420d/master.svg?token=GCIdEzacE4GW32jLVrZb7A',
      },
      {
        title: 'Code Climate',
        previewUrl: '/codeclimate/issues/twbs/bootstrap.svg',
      },
      {
        title: 'Code Climate',
        previewUrl: '/codeclimate/maintainability/angular/angular.js.svg',
      },
      {
        title: 'Code Climate',
        previewUrl:
          '/codeclimate/maintainability-percentage/angular/angular.js.svg',
      },
      {
        title: 'Code Climate',
        previewUrl: '/codeclimate/coverage/jekyll/jekyll.svg',
      },
      {
        title: 'Code Climate',
        previewUrl: '/codeclimate/coverage-letter/jekyll/jekyll.svg',
      },
      {
        title: 'Code Climate',
        previewUrl: '/codeclimate/tech-debt/jekyll/jekyll.svg',
      },
      {
        title: 'Codacy grade',
        previewUrl: '/codacy/grade/e27821fb6289410b8f58338c7e0bc686.svg',
      },
      {
        title: 'Codacy branch grade',
        previewUrl: '/codacy/grade/e27821fb6289410b8f58338c7e0bc686/master.svg',
      },
      {
        title: 'Codacy coverage',
        previewUrl: '/codacy/coverage/c44df2d9c89a4809896914fd1a40bedd.svg',
      },
      {
        title: 'Codacy branch coverage',
        previewUrl:
          '/codacy/coverage/c44df2d9c89a4809896914fd1a40bedd/master.svg',
      },
      {
        title: 'Docker Automated build',
        previewUrl: '/docker/automated/jrottenberg/ffmpeg.svg',
        keywords: ['docker', 'automated', 'build'],
      },
      {
        title: 'Docker Build Status',
        previewUrl: '/docker/build/jrottenberg/ffmpeg.svg',
        keywords: ['docker', 'build', 'status'],
      },
    ],
  },
  {
    category: {
      id: 'chat',
      name: 'Chat',
    },
    examples: [
      {
        title: 'Discourse topics',
        previewUrl: '/discourse/https/meta.discourse.org/topics.svg',
      },
      {
        title: 'Discourse posts',
        previewUrl: '/discourse/https/meta.discourse.org/posts.svg',
      },
      {
        title: 'Discourse users',
        previewUrl: '/discourse/https/meta.discourse.org/users.svg',
      },
      {
        title: 'Discourse likes',
        previewUrl: '/discourse/https/meta.discourse.org/likes.svg',
      },
      {
        title: 'Discourse status',
        previewUrl: '/discourse/https/meta.discourse.org/status.svg',
      },
      {
        title: 'Gitter',
        previewUrl: '/gitter/room/nwjs/nw.js.svg',
      },
      {
        title: 'Discord',
        previewUrl: '/discord/102860784329052160.svg',
      },
    ],
  },
  {
    category: {
      id: 'dependencies',
      name: 'Dependencies',
    },
    examples: [
      {
        title: 'Depfu',
        previewUrl: '/depfu/depfu/example-ruby.svg',
      },
      {
        title: 'Hackage-Deps',
        previewUrl: '/hackage-deps/v/lens.svg',
      },
      {
        title: 'Requires.io',
        previewUrl: '/requires/github/celery/celery.svg',
      },
      {
        title: 'David',
        previewUrl: '/david/expressjs/express.svg',
      },
      {
        title: 'David',
        previewUrl: '/david/dev/expressjs/express.svg',
      },
      {
        title: 'David',
        previewUrl: '/david/optional/elnounch/byebye.svg',
      },
      {
        title: 'David',
        previewUrl: '/david/peer/webcomponents/generator-element.svg',
      },
      {
        title: 'David (path)',
        previewUrl: '/david/babel/babel.svg?path=packages/babel-core',
      },
      {
        title: 'Libraries.io for releases',
        previewUrl: '/librariesio/release/hex/phoenix/1.0.3.svg',
      },
      {
        title: 'Libraries.io for GitHub',
        previewUrl: '/librariesio/github/phoenixframework/phoenix.svg',
      },
    ],
  },
  {
    category: {
      id: 'size',
      name: 'Size',
    },
    examples: [
      {
        title: 'npm bundle size (minified)',
        previewUrl: '/bundlephobia/min/react.svg',
        keywords: ['node'],
      },
      {
        title: 'npm bundle size (minified + gzip)',
        previewUrl: '/bundlephobia/minzip/react.svg',
        keywords: ['node'],
      },
      {
        title: 'GitHub code size in bytes',
        previewUrl: '/github/languages/code-size/badges/shields.svg',
        keywords: ['GitHub', 'byte', 'code', 'size'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub repo size in bytes',
        previewUrl: '/github/repo-size/badges/shields.svg',
        keywords: ['GitHub', 'repo', 'size'],
        documentation: githubDoc,
      },
      {
        title: 'Github file size',
        previewUrl:
          '/github/size/webcaetano/craft/build/phaser-craft.min.js.svg',
        keywords: ['GitHub', 'file', 'size'],
        documentation: githubDoc,
      },
      {
        title: 'ImageLayers Size',
        previewUrl: '/imagelayers/image-size/_/ubuntu/latest.svg',
        keywords: ['imagelayers'],
      },
      {
        title: 'ImageLayers Layers',
        previewUrl: '/imagelayers/layers/_/ubuntu/latest.svg',
        keywords: ['imagelayers'],
      },
      {
        title: 'MicroBadger Size',
        previewUrl: '/microbadger/image-size/fedora/apache.svg',
        keywords: ['docker'],
      },
      {
        title: 'MicroBadger Size (tag)',
        previewUrl: '/microbadger/image-size/_/httpd/alpine.svg',
        keywords: ['docker'],
      },
      {
        title: 'MicroBadger Layers',
        previewUrl: '/microbadger/layers/_/httpd.svg',
        keywords: ['docker'],
      },
      {
        title: 'MicroBadger Layers (tag)',
        previewUrl: '/microbadger/layers/_/httpd/alpine.svg',
        keywords: ['docker'],
      },
    ],
  },
  {
    category: {
      id: 'downloads',
      name: 'Downloads',
    },
    examples: [
      {
        title: 'Github All Releases',
        previewUrl: '/github/downloads/atom/atom/total.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'Github Releases',
        previewUrl: '/github/downloads/atom/atom/latest/total.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'Github Pre-Releases',
        previewUrl: '/github/downloads-pre/atom/atom/latest/total.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'Github Releases (by Release)',
        previewUrl: '/github/downloads/atom/atom/v0.190.0/total.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'Github Releases (by Asset)',
        previewUrl: '/github/downloads/atom/atom/latest/atom-amd64.deb.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'Github Pre-Releases (by Asset)',
        previewUrl: '/github/downloads-pre/atom/atom/latest/atom-amd64.deb.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'Chocolatey',
        previewUrl: '/chocolatey/dt/scriptcs.svg',
      },
      {
        title: 'NuGet',
        previewUrl: '/nuget/dt/Microsoft.AspNetCore.Mvc.svg',
      },
      {
        title: 'MyGet',
        previewUrl: '/myget/mongodb/dt/MongoDB.Driver.Core.svg',
      },
      {
        title: 'MyGet tenant',
        previewUrl:
          '/dotnet.myget/dotnet-coreclr/dt/Microsoft.DotNet.CoreCLR.svg',
      },
      {
        title: 'PowerShell Gallery',
        previewUrl: '/powershellgallery/dt/ACMESharp.svg',
      },
      {
        title: 'Conda',
        previewUrl: '/conda/dn/conda-forge/python.svg',
        keywords: ['conda'],
      },
      {
        title: 'Crates.io',
        previewUrl: '/crates/d/rustc-serialize.svg',
        keywords: ['Rust'],
      },
      {
        title: 'Crates.io',
        previewUrl: '/crates/dv/rustc-serialize.svg',
        keywords: ['Rust'],
      },
      {
        title: 'Packagist',
        previewUrl: '/packagist/dm/doctrine/orm.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Packagist',
        previewUrl: '/packagist/dd/doctrine/orm.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Packagist',
        previewUrl: '/packagist/dt/doctrine/orm.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Hex.pm',
        previewUrl: '/hexpm/dw/plug.svg',
      },
      {
        title: 'Hex.pm',
        previewUrl: '/hexpm/dd/plug.svg',
      },
      {
        title: 'Hex.pm',
        previewUrl: '/hexpm/dt/plug.svg',
      },
      {
        title: 'WordPress plugin',
        previewUrl: '/wordpress/plugin/dt/akismet.svg',
      },
      {
        title: 'WordPress theme',
        previewUrl: '/wordpress/theme/dt/hestia.svg',
      },
      {
        title: 'SourceForge',
        previewUrl: '/sourceforge/dm/sevenzip.svg',
      },
      {
        title: 'SourceForge',
        previewUrl: '/sourceforge/dw/sevenzip.svg',
      },
      {
        title: 'SourceForge',
        previewUrl: '/sourceforge/dd/sevenzip.svg',
      },
      {
        title: 'SourceForge',
        previewUrl: '/sourceforge/dt/sevenzip.svg',
      },
      {
        title: 'SourceForge',
        previewUrl: '/sourceforge/dt/arianne/stendhal.svg',
      },
      {
        title: 'Puppet Forge',
        previewUrl: '/puppetforge/dt/camptocamp/openldap.svg',
      },
      {
        title: 'DUB',
        previewUrl: '/dub/dd/vibe-d.svg',
        keywords: ['dub'],
      },
      {
        title: 'DUB',
        previewUrl: '/dub/dw/vibe-d.svg',
        keywords: ['dub'],
      },
      {
        title: 'DUB',
        previewUrl: '/dub/dm/vibe-d/latest.svg',
        keywords: ['dub'],
      },
      {
        title: 'DUB',
        previewUrl: '/dub/dt/vibe-d/0.7.23.svg',
        keywords: ['dub'],
      },
      {
        title: 'Package Control',
        previewUrl: '/packagecontrol/dm/GitGutter.svg',
        keywords: ['sublime'],
      },
      {
        title: 'Package Control',
        previewUrl: '/packagecontrol/dw/GitGutter.svg',
        keywords: ['sublime'],
      },
      {
        title: 'Package Control',
        previewUrl: '/packagecontrol/dd/GitGutter.svg',
        keywords: ['sublime'],
      },
      {
        title: 'Package Control',
        previewUrl: '/packagecontrol/dt/GitGutter.svg',
        keywords: ['sublime'],
      },
      {
        title: 'CocoaPods',
        previewUrl: '/cocoapods/dt/AFNetworking.svg',
        keywords: ['cocoapods'],
      },
      {
        title: 'CocoaPods',
        previewUrl: '/cocoapods/dm/AFNetworking.svg',
        keywords: ['cocoapods'],
      },
      {
        title: 'CocoaPods',
        previewUrl: '/cocoapods/dw/AFNetworking.svg',
        keywords: ['cocoapods'],
      },
      {
        title: 'Mozilla Add-on',
        previewUrl: '/amo/d/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Visual Studio Marketplace',
        previewUrl: '/vscode-marketplace/d/ritwickdey.LiveServer.svg',
        keywords: ['vscode-marketplace'],
      },
      {
        title: 'Eclipse Marketplace',
        previewUrl: '/eclipse-marketplace/dt/notepad4e.svg',
        keywords: ['eclipse', 'marketplace'],
      },
      {
        title: 'Eclipse Marketplace',
        previewUrl: '/eclipse-marketplace/dm/notepad4e.svg',
        keywords: ['eclipse', 'marketplace'],
      },
      {
        title: 'JetBrains IntelliJ plugins',
        previewUrl: '/jetbrains/plugin/d/1347-scala.svg',
        keywords: ['jetbrains', 'plugin'],
      },
      {
        title: 'JetBrains ReSharper plugins',
        previewUrl: '/resharper/dt/ReSharper.Nuke.svg',
        keywords: ['jetbrains', 'plugin'],
      },
      {
        title: 'Ansible Role',
        previewUrl: '/ansible/role/d/3078.svg',
      },
      {
        title: 'Docker Pulls',
        previewUrl: '/docker/pulls/mashape/kong.svg',
        keywords: ['docker', 'pulls'],
      },
    ],
  },
  {
    category: {
      id: 'funding',
      name: 'Funding',
    },
    examples: [
      {
        title: 'Liberapay receiving',
        previewUrl: '/liberapay/receives/Changaco.svg',
      },
      {
        title: 'Liberapay giving',
        previewUrl: '/liberapay/gives/Changaco.svg',
      },
      {
        title: 'Liberapay patrons',
        previewUrl: '/liberapay/patrons/Changaco.svg',
      },
      {
        title: 'Liberapay goal progress',
        previewUrl: '/liberapay/goal/Changaco.svg',
      },
      {
        title: 'Bountysource',
        previewUrl: '/bountysource/team/mozilla-core/activity.svg',
      },
      {
        title: 'Beerpay',
        previewUrl: '/beerpay/hashdog/scrapfy-chrome-extension.svg',
      },
      {
        title: 'Codetally',
        previewUrl: '/codetally/triggerman722/colorstrap.svg',
      },
      {
        title: 'Chrome Web Store',
        previewUrl:
          '/chrome-web-store/price/ogffaloegjglncjfehdfplabnoondfjo.svg',
        keywords: ['chrome'],
      },
    ],
  },
  {
    category: {
      id: 'issue-tracking',
      name: 'Issue Tracking',
    },
    examples: [
      {
        title: 'Bugzilla bug status',
        previewUrl: '/bugzilla/996038.svg',
        keywords: ['Bugzilla', 'bug'],
        documentation: bugzillaDoc,
      },
      {
        title: 'GitHub issues',
        previewUrl: '/github/issues/badges/shields.svg',
        keywords: ['GitHub', 'issue'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issues',
        previewUrl: '/github/issues-raw/badges/shields.svg',
        keywords: ['GitHub', 'issue'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull requests',
        previewUrl: '/github/issues-pr/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'pullrequest', 'pr'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull requests',
        previewUrl: '/github/issues-pr-raw/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'pullrequest', 'pr'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub closed issues',
        previewUrl: '/github/issues-closed/badges/shields.svg',
        keywords: ['GitHub', 'issue'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub closed issues',
        previewUrl: '/github/issues-closed-raw/badges/shields.svg',
        keywords: ['GitHub', 'issue'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub closed pull requests',
        previewUrl: '/github/issues-pr-closed/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'pullrequest', 'pr'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub closed pull requests',
        previewUrl: '/github/issues-pr-closed-raw/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'pullrequest', 'pr'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issues by-label',
        previewUrl: '/github/issues/badges/shields/service-badge.svg',
        keywords: ['GitHub', 'issue', 'label'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issues by-label',
        previewUrl: '/github/issues-raw/badges/shields/service-badge.svg',
        keywords: ['GitHub', 'issue', 'label'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull requests by-label',
        previewUrl: '/github/issues-pr/badges/shields/service-badge.svg',
        keywords: ['GitHub', 'pullrequests', 'label'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull requests by-label',
        previewUrl: '/github/issues-pr-raw/badges/shields/service-badge.svg',
        keywords: ['GitHub', 'pullrequests', 'label'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request state',
        previewUrl: '/github/issues/detail/s/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request title',
        previewUrl: '/github/issues/detail/title/badges/shields/1290.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request author',
        previewUrl: '/github/issues/detail/u/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request label',
        previewUrl: '/github/issues/detail/label/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrqeuest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request comments',
        previewUrl: '/github/issues/detail/comments/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request age',
        previewUrl: '/github/issues/detail/age/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request last update',
        previewUrl: '/github/issues/detail/last-update/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'Bitbucket issues',
        previewUrl: '/bitbucket/issues/atlassian/python-bitbucket.svg',
      },
      {
        title: 'Bitbucket issues',
        previewUrl: '/bitbucket/issues-raw/atlassian/python-bitbucket.svg',
        keywords: ['Bitbucket'],
      },
      {
        title: 'Bitbucket open pull requests',
        previewUrl: '/bitbucket/pr/osrf/gazebo.svg',
      },
      {
        title: 'Bitbucket open pull requests',
        previewUrl: '/bitbucket/pr-raw/osrf/gazebo.svg',
        keywords: ['Bitbucket'],
      },
      {
        title: 'JIRA issue',
        previewUrl: '/jira/issue/https/issues.apache.org/jira/KAFKA-2896.svg',
      },
      {
        title: 'JIRA sprint completion',
        previewUrl: '/jira/sprint/https/jira.spring.io/94.svg',
        documentation: jiraSprintCompletionDoc,
      },
      {
        title: 'Waffle.io',
        previewUrl:
          '/waffle/label/evancohen/smart-mirror/status%3A%20in%20progress.svg',
      },
    ],
  },
  {
    category: {
      id: 'license',
      name: 'License',
    },
    examples: [
      {
        title: 'AUR',
        previewUrl: '/aur/license/yaourt.svg',
        keywords: ['aur'],
      },
      {
        title: 'GitHub',
        previewUrl: '/github/license/mashape/apistatus.svg',
        keywords: ['GitHub', 'license'],
        documentation: githubDoc,
      },
      {
        title: 'Crates.io',
        previewUrl: '/crates/l/rustc-serialize.svg',
        keywords: ['Rust'],
      },
      {
        title: 'Packagist',
        previewUrl: '/packagist/l/doctrine/orm.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Bower',
        previewUrl: '/bower/l/bootstrap.svg',
      },
      {
        title: 'Hex.pm',
        previewUrl: '/hexpm/l/plug.svg',
      },
      {
        title: 'CocoaPods',
        previewUrl: '/cocoapods/l/AFNetworking.svg',
      },
      {
        title: 'CPAN',
        previewUrl: '/cpan/l/Config-Augeas.svg',
        keywords: ['perl'],
      },
      {
        title: 'CRAN',
        previewUrl: '/cran/l/devtools.svg',
        keywords: ['R'],
      },
      {
        title: 'CTAN',
        previewUrl: '/ctan/l/novel.svg',
        keywords: ['tex'],
      },
      {
        title: 'DUB',
        previewUrl: '/dub/l/vibe-d.svg',
        keywords: ['dub'],
      },
    ],
  },
  {
    category: {
      id: 'rating',
      name: 'Rating',
    },
    examples: [
      {
        title: 'Chrome Web Store',
        previewUrl:
          '/chrome-web-store/rating/ogffaloegjglncjfehdfplabnoondfjo.svg',
        keywords: ['chrome'],
      },
      {
        title: 'Chrome Web Store',
        previewUrl:
          '/chrome-web-store/stars/ogffaloegjglncjfehdfplabnoondfjo.svg',
        keywords: ['chrome'],
      },
      {
        title: 'Chrome Web Store',
        previewUrl:
          '/chrome-web-store/rating-count/ogffaloegjglncjfehdfplabnoondfjo.svg',
        keywords: ['chrome'],
      },
      {
        title: 'AUR',
        previewUrl: '/aur/votes/yaourt.svg',
        keywords: ['aur'],
      },
      {
        title: 'Mozilla Add-on',
        previewUrl: '/amo/rating/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Mozilla Add-on',
        previewUrl: '/amo/stars/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Plugin on redmine.org',
        previewUrl:
          '/redmine/plugin/rating/redmine_xlsx_format_issue_exporter.svg',
        keywords: ['redmine', 'plugin'],
      },
      {
        title: 'Plugin on redmine.org',
        previewUrl:
          '/redmine/plugin/stars/redmine_xlsx_format_issue_exporter.svg',
        keywords: ['redmine', 'plugin'],
      },
      {
        title: 'Vaadin Directory',
        previewUrl: '/vaadin-directory/rating/vaadinvaadin-grid.svg',
        keywords: ['vaadin-directory', 'vaadin directory', 'rating'],
      },
      {
        title: 'Vaadin Directory',
        previewUrl: '/vaadin-directory/stars/vaadinvaadin-grid.svg',
        keywords: ['vaadin-directory', 'vaadin directory', 'star', 'stars'],
      },
      {
        title: 'Vaadin Directory',
        previewUrl: '/vaadin-directory/rating-count/vaadinvaadin-grid.svg',
        keywords: [
          'vaadin-directory',
          'vaadin directory',
          'rating-count',
          'rating count',
        ],
      },
      {
        title: 'WordPress plugin rating',
        previewUrl: '/wordpress/plugin/r/akismet.svg',
      },
      {
        title: 'WordPress theme rating',
        previewUrl: '/wordpress/theme/r/hestia.svg',
      },
      {
        title: 'Visual Studio Marketplace',
        previewUrl: '/vscode-marketplace/r/ritwickdey.LiveServer.svg',
        keywords: ['vscode-marketplace'],
      },
      {
        title: 'StackExchange',
        previewUrl: '/stackexchange/tex/r/951.svg',
      },
      {
        title: 'Docker Stars',
        previewUrl: '/docker/stars/_/ubuntu.svg',
        keywords: ['docker', 'stars'],
      },
    ],
  },
  {
    category: {
      id: 'social',
      name: 'Social',
    },
    examples: [
      {
        title: 'GitHub forks',
        previewUrl: '/github/forks/badges/shields.svg?style=social&label=Fork',
        documentation: githubDoc,
      },
      {
        title: 'GitHub stars',
        previewUrl: '/github/stars/badges/shields.svg?style=social&label=Stars',
        documentation: githubDoc,
      },
      {
        title: 'GitHub watchers',
        previewUrl:
          '/github/watchers/badges/shields.svg?style=social&label=Watch',
        documentation: githubDoc,
      },
      {
        title: 'GitHub followers',
        previewUrl: '/github/followers/espadrine.svg?style=social&label=Follow',
        documentation: githubDoc,
      },
      {
        title: 'Twitter URL',
        previewUrl: '/twitter/url/http/shields.io.svg?style=social',
      },
      {
        title: 'Twitter Follow',
        previewUrl: '/twitter/follow/espadrine.svg?style=social&label=Follow',
      },
    ],
  },
  {
    category: {
      id: 'version',
      name: 'Version',
    },
    examples: [
      {
        title: 'npm bundle size (minified)',
        previewUrl: '/bundlephobia/min/react.svg',
        keywords: ['node'],
      },
      {
        title: 'npm bundle size (minified + gzip)',
        previewUrl: '/bundlephobia/minzip/react.svg',
        keywords: ['node'],
      },
      {
        title: 'Conda',
        previewUrl: '/conda/v/conda-forge/python.svg',
        keywords: ['conda'],
      },
      {
        title: 'Conda (channel only)',
        previewUrl: '/conda/vn/conda-forge/python.svg',
        keywords: ['conda'],
      },
      {
        title: 'LuaRocks',
        previewUrl: '/luarocks/v/mpeterv/luacheck.svg',
        keywords: ['lua'],
      },
      {
        title: 'Hackage',
        previewUrl: '/hackage/v/lens.svg',
      },
      {
        title: 'Elm package',
        previewUrl: '/elm-package/v/elm-lang/core.svg',
        keywords: ['Elm'],
      },
      {
        title: 'Crates.io',
        previewUrl: '/crates/v/rustc-serialize.svg',
        keywords: ['Rust'],
      },
      {
        title: 'Packagist',
        previewUrl: '/packagist/v/symfony/symfony.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Packagist Pre Release',
        previewUrl: '/packagist/vpre/symfony/symfony.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Bintray',
        previewUrl: '/bintray/v/asciidoctor/maven/asciidoctorj.svg',
      },
      {
        title: 'Maven metadata URL',
        previewUrl:
          '/maven-metadata/v/http/central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml.svg',
      },
      {
        title: 'CocoaPods',
        previewUrl: '/cocoapods/v/AFNetworking.svg',
      },
      {
        title: 'Bower',
        previewUrl: '/bower/v/bootstrap.svg',
      },
      {
        title: 'Bower Pre Release',
        previewUrl: '/bower/vpre/bootstrap.svg',
      },
      {
        title: 'Pub',
        previewUrl: '/pub/v/box2d.svg',
      },
      {
        title: 'Hex.pm',
        previewUrl: '/hexpm/v/plug.svg',
      },
      {
        title: 'GitHub tag',
        previewUrl: '/github/tag/expressjs/express.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub package version',
        previewUrl: '/github/package-json/v/badges/shields.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub manifest version',
        previewUrl: '/github/manifest-json/v/RedSparr0w/IndieGala-Helper.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub release',
        previewUrl: '/github/release/qubyte/rubidium.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub (pre-)release',
        previewUrl: '/github/release/qubyte/rubidium/all.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub commits',
        previewUrl: '/github/commits-since/SubtitleEdit/subtitleedit/3.4.7.svg',
        keywords: ['GitHub', 'commit'],
        documentation: githubDoc,
      },
      {
        title: 'Github commits (since latest release)',
        previewUrl:
          '/github/commits-since/SubtitleEdit/subtitleedit/latest.svg',
        keywords: ['GitHub', 'commit'],
        documentation: githubDoc,
      },
      {
        title: 'Chef cookbook',
        previewUrl: '/cookbook/v/chef-sugar.svg',
      },
      {
        title: 'NuGet',
        previewUrl: '/nuget/v/Nuget.Core.svg',
      },
      {
        title: 'NuGet Pre Release',
        previewUrl: '/nuget/vpre/Microsoft.AspNet.Mvc.svg',
      },
      {
        title: 'MyGet',
        previewUrl: '/myget/mongodb/v/MongoDB.Driver.Core.svg',
      },
      {
        title: 'MyGet Pre Release',
        previewUrl: '/myget/yolodev/vpre/YoloDev.Dnx.FSharp.svg',
      },
      {
        title: 'MyGet tenant',
        previewUrl:
          '/dotnet.myget/dotnet-coreclr/v/Microsoft.DotNet.CoreCLR.svg',
      },
      {
        title: 'Chocolatey',
        previewUrl: '/chocolatey/v/git.svg',
      },
      {
        title: 'PowerShell Gallery',
        previewUrl: '/powershellgallery/v/Zyborg.Vault.svg',
      },
      {
        title: 'Puppet Forge',
        previewUrl: '/puppetforge/v/vStone/percona.svg',
      },
      {
        title: 'Maven Central',
        previewUrl: '/maven-central/v/org.apache.maven/apache-maven.svg',
      },
      {
        title: 'Maven Central with version prefix filter',
        previewUrl: '/maven-central/v/org.apache.maven/apache-maven/2.svg',
      },
      {
        title: 'Sonatype Nexus (Releases)',
        previewUrl:
          '/nexus/r/https/oss.sonatype.org/com.google.guava/guava.svg',
      },
      {
        title: 'Sonatype Nexus (Snapshots)',
        previewUrl:
          '/nexus/s/https/oss.sonatype.org/com.google.guava/guava.svg',
      },
      {
        title: 'WordPress plugin',
        previewUrl: '/wordpress/plugin/v/akismet.svg',
      },
      {
        title: 'WordPress',
        previewUrl: '/wordpress/v/akismet.svg',
      },
      {
        title: 'CPAN',
        previewUrl: '/cpan/v/Config-Augeas.svg',
        keywords: ['perl'],
      },
      {
        title: 'CRAN',
        previewUrl: '/cran/v/devtools.svg',
        keywords: ['R'],
      },
      {
        title: 'CTAN',
        previewUrl: '/ctan/v/tex.svg',
        keywords: ['tex'],
      },
      {
        title: 'DUB',
        previewUrl: '/dub/v/vibe-d.svg',
        keywords: ['dub'],
      },
      {
        title: 'AUR',
        previewUrl: '/aur/version/yaourt.svg',
        keywords: ['aur'],
      },
      {
        title: 'Chrome Web Store',
        previewUrl: '/chrome-web-store/v/ogffaloegjglncjfehdfplabnoondfjo.svg',
        keywords: ['chrome'],
      },
      {
        title: 'homebrew',
        previewUrl: '/homebrew/v/cake.svg',
      },
      {
        title: 'Mozilla Add-on',
        previewUrl: '/amo/v/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Visual Studio Marketplace',
        previewUrl: '/vscode-marketplace/v/ritwickdey.LiveServer.svg',
        keywords: ['vscode-marketplace'],
      },
      {
        title: 'Eclipse Marketplace',
        previewUrl: '/eclipse-marketplace/v/notepad4e.svg',
        keywords: ['eclipse', 'marketplace'],
      },
      {
        title: 'iTunes App Store',
        previewUrl: '/itunes/v/803453959.svg',
        urlPattern: '/itunes/v/:bundle-id.svg',
        exampleUrl: '/itunes/v/803453959.svg',
      },
      {
        title: 'JitPack',
        previewUrl: '/jitpack/v/jitpack/maven-simple.svg',
        keywords: ['jitpack', 'java', 'maven'],
      },
      {
        title: 'Jenkins Plugins',
        previewUrl: '/jenkins/plugin/v/blueocean.svg',
      },
      {
        title: 'JetBrains IntelliJ Plugins',
        previewUrl: '/jetbrains/plugin/v/9630-a8translate.svg',
      },
      {
        title: 'JetBrains ReSharper Plugins',
        previewUrl: '/resharper/v/ReSharper.Nuke.svg',
      },
      {
        title: 'JetBrains ReSharper Plugins Pre-release',
        previewUrl: '/resharper/vpre/ReSharper.Nuke.svg',
      },
      {
        title: 'Vaadin Directory',
        previewUrl: '/vaadin-directory/v/vaadinvaadin-grid.svg',
        keywords: [
          'vaadin-directory',
          'vaadin directory',
          'version',
          'latest version',
        ],
      },
    ],
  },
  {
    category: {
      id: 'platform-support',
      name: 'Platform & Version Support',
    },
    examples: [
      {
        title: 'PyPI - Python Version',
        previewUrl: '/pypi/pyversions/Django.svg',
        keywords: ['python', 'pypi'],
      },
      {
        title: 'PyPI - Django Version',
        previewUrl: '/pypi/djversions/djangorestframework.svg',
        keywords: ['python', 'pypi', 'django'],
      },
      {
        title: 'Conda',
        previewUrl: '/conda/pn/conda-forge/python.svg',
        keywords: ['conda'],
      },
      {
        title: 'HHVM',
        previewUrl: '/hhvm/symfony/symfony.svg',
      },
      {
        title: 'HHVM (branch)',
        previewUrl: '/hhvm/symfony/symfony/master.svg',
      },
      {
        title: 'CocoaPods',
        previewUrl: '/cocoapods/p/AFNetworking.svg',
      },
      {
        title: 'PHP from Travis config',
        previewUrl: '/travis/php-v/symfony/symfony.svg',
      },
      {
        title: 'PHP from Packagist',
        previewUrl: '/packagist/php-v/symfony/symfony.svg',
      },
      {
        title: 'PHP version from PHP-Eye',
        previewUrl: '/php-eye/symfony/symfony.svg',
      },
    ],
  },
  {
    category: {
      id: 'monitoring',
      name: 'Monitoring',
    },
    examples: [
      {
        title: 'Website',
        previewUrl:
          '/website-up-down-green-red/http/shields.io.svg?label=my-website',
        keywords: ['website'],
        documentation: websiteDoc,
      },
    ],
  },
  {
    category: {
      id: 'other',
      name: 'Other',
    },
    examples: [
      {
        title: 'Wheelmap',
        previewUrl: '/wheelmap/a/2323004600.svg',
      },
      {
        title: 'GitHub Release Date',
        previewUrl: '/github/release-date/SubtitleEdit/subtitleedit.svg',
        keywords: ['GitHub', 'release', 'date'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub (Pre-)Release Date',
        previewUrl: '/github/release-date-pre/Cockatrice/Cockatrice.svg',
        keywords: ['GitHub', 'release', 'date'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull request check state',
        previewUrl: '/github/status/s/pulls/badges/shields/1110.svg',
        keywords: ['GitHub', 'pullrequest', 'detail', 'check'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull request check contexts',
        previewUrl: '/github/status/contexts/pulls/badges/shields/1110.svg',
        keywords: ['GitHub', 'pullrequest', 'detail', 'check'],
        documentation: githubDoc,
      },
      {
        title: 'Github commit merge status',
        previewUrl:
          '/github/commit-status/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.svg',
        keywords: ['GitHub', 'commit', 'branch', 'merge'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub contributors',
        previewUrl: '/github/contributors/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'contributor'],
        documentation: githubDoc,
      },
      {
        title: 'Github search hit counter',
        previewUrl: '/github/search/torvalds/linux/goto.svg',
        keywords: ['GitHub', 'search', 'hit', 'counter'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub commit activity the past week, 4 weeks, year',
        previewUrl: '/github/commit-activity/y/eslint/eslint.svg',
        keywords: ['GitHub', 'commit', 'commits', 'activity'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub last commit',
        previewUrl: '/github/last-commit/google/skia.svg',
        keywords: ['GitHub', 'last', 'latest', 'commit'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub last commit (branch)',
        previewUrl: '/github/last-commit/google/skia/infra/config.svg',
        keywords: ['GitHub', 'last', 'latest', 'commit'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub top language',
        previewUrl: '/github/languages/top/badges/shields.svg',
        keywords: ['GitHub', 'top', 'language'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub language count',
        previewUrl: '/github/languages/count/badges/shields.svg',
        keywords: ['GitHub', 'language', 'count'],
        documentation: githubDoc,
      },
      {
        title: 'Libscore',
        previewUrl: '/libscore/s/jQuery.svg',
      },
      {
        title: 'Puppet Forge',
        previewUrl: '/puppetforge/e/camptocamp/openssl.svg',
      },
      {
        title: 'Puppet Forge',
        previewUrl: '/puppetforge/f/camptocamp/openssl.svg',
      },
      {
        title: 'Puppet Forge',
        previewUrl: '/puppetforge/rc/camptocamp.svg',
      },
      {
        title: 'Puppet Forge',
        previewUrl: '/puppetforge/mc/camptocamp.svg',
      },
      {
        title: 'Maintenance',
        previewUrl: '/maintenance/yes/2017.svg',
      },
      {
        title: 'Chrome Web Store',
        previewUrl:
          '/chrome-web-store/users/ogffaloegjglncjfehdfplabnoondfjo.svg',
        keywords: ['chrome'],
      },
      {
        title: 'Mozilla Add-on',
        previewUrl: '/amo/users/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Swagger Validator',
        previewUrl:
          '/swagger/valid/2.0/https/raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/petstore-expanded.json.svg',
      },
      {
        title: 'Eclipse Marketplace',
        previewUrl: '/eclipse-marketplace/favorites/notepad4e.svg',
        keywords: ['eclipse', 'marketplace'],
      },
      {
        title: 'Eclipse Marketplace',
        previewUrl: '/eclipse-marketplace/last-update/notepad4e.svg',
        keywords: ['eclipse', 'marketplace'],
      },
      {
        title: 'Vaadin Directory',
        previewUrl: '/vaadin-directory/status/vaadinvaadin-grid.svg',
        keywords: ['vaadin-directory', 'vaadin directory', 'status'],
      },
      {
        title: 'Vaadin Directory',
        previewUrl: '/vaadin-directory/release-date/vaadinvaadin-grid.svg',
        keywords: [
          'vaadin-directory',
          'vaadin directory',
          'date',
          'latest release date',
        ],
      },
      {
        title: 'CocoaPods',
        previewUrl: '/cocoapods/at/AFNetworking.svg',
      },
      {
        title: 'CocoaPods',
        previewUrl: '/cocoapods/aw/AFNetworking.svg',
      },
      {
        title: 'CocoaPods',
        previewUrl: '/cocoapods/metrics/doc-percent/AFNetworking.svg',
      },
      {
        title: 'Ansible Role',
        previewUrl: '/ansible/role/3078.svg',
      },
      {
        title: 'StackExchange',
        previewUrl: '/stackexchange/stackoverflow/t/augeas.svg',
      },
      {
        title: 'NetflixOSS Lifecycle',
        previewUrl: '/osslifecycle/Netflix/osstracker.svg',
      },
      {
        title: 'Sourcegraph for Repo Reference Count',
        previewUrl: '/sourcegraph/rrc/github.com/gorilla/mux.svg',
      },
      {
        title: 'SemVer Compatibility',
        previewUrl: '/dependabot/semver/bundler/puma.svg',
      },
    ],
  },
]

function findCategory(wantedCategory) {
  return allBadgeExamples.find(
    thisCat => thisCat.category.id === wantedCategory
  )
}

function loadExamples() {
  loadServiceClasses().forEach(ServiceClass => {
    const prepared = ServiceClass.prepareExamples()
    if (prepared.length === 0) {
      return
    }
    const category = findCategory(ServiceClass.category)
    if (category === undefined) {
      throw Error(
        `Unknown category ${ServiceClass.category} referenced in ${
          ServiceClass.name
        }`
      )
    }
    category.examples = category.examples.concat(prepared)
  })
}
loadExamples()

module.exports = allBadgeExamples
module.exports.findCategory = findCategory
