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
        previewUri: '/travis/rust-lang/rust.svg',
        exampleUri: '/travis/USER/REPO.svg',
      },
      {
        title: 'Travis (.org) branch',
        previewUri: '/travis/rust-lang/rust/master.svg',
        exampleUri: '/travis/USER/REPO/BRANCH.svg',
      },
      {
        title: 'Travis (.com)',
        previewUri: '/travis/com/ivandelabeldad/rackian-gateway.svg',
        exampleUri: '/travis/com/USER/REPO.svg',
      },
      {
        title: 'Travis (.com) branch',
        previewUri: '/travis/com/ivandelabeldad/rackian-gateway/master.svg',
        exampleUri: '/travis/com/USER/REPO/BRANCH.svg',
      },
      {
        title: 'TeamCity CodeBetter',
        previewUri: '/teamcity/codebetter/bt428.svg',
      },
      {
        title: 'TeamCity (simple build status)',
        previewUri: '/teamcity/http/teamcity.jetbrains.com/s/bt345.svg',
      },
      {
        title: 'TeamCity (full build status)',
        keywords: ['teamcity'],
        exampleUri: '/teamcity/http/teamcity.jetbrains.com/e/bt345.svg',
      },
      {
        title: 'AppVeyor tests',
        previewUri: '/appveyor/tests/NZSmartie/coap-net-iu0to.svg',
      },
      {
        title: 'AppVeyor tests branch',
        previewUri: '/appveyor/tests/NZSmartie/coap-net-iu0to/master.svg',
      },
      {
        title: 'Buildkite',
        previewUri:
          '/buildkite/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489/master.svg',
      },
      {
        title: 'Codeship',
        previewUri: '/codeship/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1.svg',
      },
      {
        title: 'Codeship',
        previewUri: '/codeship/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1/master.svg',
      },
      {
        title: 'CircleCI',
        previewUri: '/circleci/project/github/RedSparr0w/node-csgo-parser.svg',
      },
      {
        title: 'CircleCI branch',
        previewUri:
          '/circleci/project/github/RedSparr0w/node-csgo-parser/master.svg',
      },
      {
        title: 'CircleCI token',
        previewUri:
          '/circleci/project/github/RedSparr0w/node-csgo-parser/master.svg',
        exampleUri:
          '/circleci/token/YOURTOKEN/project/github/RedSparr0w/node-csgo-parser/master.svg',
      },
      {
        title: 'Visual Studio Team services',
        previewUri:
          '/vso/build/larsbrinkhoff/953a34b9-5966-4923-a48a-c41874cfb5f5/1.svg',
        documentation: visualStudioTeamServicesDoc,
      },
      {
        title: 'Shippable',
        previewUri: '/shippable/5444c5ecb904a4b21567b0ff.svg',
      },
      {
        title: 'Shippable branch',
        previewUri: '/shippable/5444c5ecb904a4b21567b0ff/master.svg',
      },
      {
        title: 'Jenkins',
        previewUri:
          '/jenkins/s/https/jenkins.qa.ubuntu.com/view/Precise/view/All%20Precise/job/precise-desktop-amd64_default.svg',
      },
      {
        title: 'Jenkins tests',
        previewUri:
          '/jenkins/t/https/jenkins.qa.ubuntu.com/view/Precise/view/All%20Precise/job/precise-desktop-amd64_default.svg',
      },
      {
        title: 'Jenkins Coverage (Cobertura)',
        previewUri:
          '/jenkins/c/https/jenkins.qa.ubuntu.com/view/Utopic/view/All/job/address-book-service-utopic-i386-ci.svg',
      },
      {
        title: 'Jenkins Coverage (Jacoco)',
        previewUri:
          '/jenkins/j/https/jenkins.qa.ubuntu.com/view/Utopic/view/All/job/address-book-service-utopic-i386-ci.svg',
      },
      {
        title: 'Bitbucket Pipelines',
        previewUri: '/bitbucket/pipelines/atlassian/adf-builder-javascript.svg',
      },
      {
        title: 'Bitbucket Pipelines branch',
        previewUri:
          '/bitbucket/pipelines/atlassian/adf-builder-javascript/task/SECO-2168.svg',
      },
      {
        title: 'Coveralls github',
        previewUri: '/coveralls/github/jekyll/jekyll.svg',
      },
      {
        title: 'Coveralls github branch',
        previewUri: '/coveralls/github/jekyll/jekyll/master.svg',
      },
      {
        title: 'Coveralls bitbucket',
        previewUri: '/coveralls/bitbucket/pyKLIP/pyklip.svg',
      },
      {
        title: 'Coveralls bitbucket branch',
        previewUri: '/coveralls/bitbucket/pyKLIP/pyklip/master.svg',
      },
      {
        title: 'SonarQube Coverage',
        previewUri:
          '/sonar/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/coverage.svg',
      },
      {
        title: 'SonarQube Tech Debt',
        previewUri:
          '/sonar/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/tech_debt.svg',
      },
      {
        title: 'SonarQube Coverage (legacy API)',
        previewUri:
          '/sonar/4.2/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/coverage.svg',
      },
      {
        title: 'SonarQube Tech Debt (legacy API)',
        previewUri:
          '/sonar/4.2/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/tech_debt.svg',
      },
      {
        title: 'TeamCity CodeBetter Coverage',
        previewUri: '/teamcity/coverage/bt428.svg',
      },
      {
        title: 'Scrutinizer',
        previewUri: '/scrutinizer/g/filp/whoops.svg',
      },
      {
        title: 'Scrutinizer Coverage',
        previewUri: '/scrutinizer/coverage/g/filp/whoops.svg',
      },
      {
        title: 'Scrutinizer branch',
        previewUri: '/scrutinizer/coverage/g/doctrine/doctrine2/master.svg',
      },
      {
        title: 'Scrutinizer Build',
        previewUri: '/scrutinizer/build/g/filp/whoops.svg',
      },
      {
        title: 'Codecov',
        previewUri: '/codecov/c/github/codecov/example-python.svg',
      },
      {
        title: 'Codecov branch',
        previewUri: '/codecov/c/github/codecov/example-python/master.svg',
      },
      {
        title: 'Codecov private',
        previewUri: '/codecov/c/github/codecov/example-python.svg',
        exampleUri:
          '/codecov/c/token/YOURTOKEN/github/codecov/example-python.svg',
      },
      {
        title: 'Coverity Scan',
        previewUri: '/coverity/scan/3997.svg',
      },
      {
        title: 'Coverity Code Advisor On Demand Stream Badge',
        previewUri: '/coverity/ondemand/streams/STREAM.svg',
      },
      {
        title: 'Coverity Code Advisor On Demand Job Badge',
        previewUri: '/coverity/ondemand/jobs/JOB.svg',
      },
      {
        title: 'LGTM Alerts',
        previewUri: '/lgtm/alerts/g/apache/cloudstack.svg',
      },
      {
        title: 'LGTM Grade',
        previewUri: '/lgtm/grade/java/g/apache/cloudstack.svg',
      },
      {
        title: 'HHVM',
        previewUri: '/hhvm/symfony/symfony.svg',
      },
      {
        title: 'HHVM (branch)',
        previewUri: '/hhvm/symfony/symfony/master.svg',
      },
      {
        title: 'SensioLabs Insight',
        previewUri: '/sensiolabs/i/45afb680-d4e6-4e66-93ea-bcfa79eb8a87.svg',
      },
      {
        title: 'Dockbit',
        previewUri:
          '/dockbit/DockbitStatus/health.svg?token=TvavttxFHJ4qhnKstDxrvBXM',
        exampleUri:
          '/dockbit/ORGANIZATION_NAME/PIPELINE_NAME.svg?token=PIPELINE_TOKEN',
      },
      {
        title: 'continuousphp',
        previewUri: '/continuousphp/git-hub/doctrine/dbal/master.svg',
      },
      {
        title: 'Read the Docs',
        previewUri: '/readthedocs/pip.svg',
        keywords: ['documentation'],
      },
      {
        title: 'Read the Docs (version)',
        previewUri: '/readthedocs/pip/stable.svg',
        keywords: ['documentation'],
      },
      {
        title: 'Bitrise',
        previewUri:
          '/bitrise/cde737473028420d/master.svg?token=GCIdEzacE4GW32jLVrZb7A',
        exampleUri: '/bitrise/APP-ID/BRANCH.svg?token=APP-STATUS-BADGE-TOKEN',
      },
      {
        title: 'Code Climate',
        previewUri: '/codeclimate/issues/twbs/bootstrap.svg',
      },
      {
        title: 'Code Climate',
        previewUri: '/codeclimate/maintainability/angular/angular.js.svg',
      },
      {
        title: 'Code Climate',
        previewUri:
          '/codeclimate/maintainability-percentage/angular/angular.js.svg',
      },
      {
        title: 'Code Climate',
        previewUri: '/codeclimate/coverage/jekyll/jekyll.svg',
      },
      {
        title: 'Code Climate',
        previewUri: '/codeclimate/coverage-letter/jekyll/jekyll.svg',
      },
      {
        title: 'Code Climate',
        previewUri: '/codeclimate/tech-debt/jekyll/jekyll.svg',
      },
      {
        title: 'Codacy grade',
        previewUri: '/codacy/grade/e27821fb6289410b8f58338c7e0bc686.svg',
      },
      {
        title: 'Codacy branch grade',
        previewUri: '/codacy/grade/e27821fb6289410b8f58338c7e0bc686/master.svg',
      },
      {
        title: 'Codacy coverage',
        previewUri: '/codacy/coverage/c44df2d9c89a4809896914fd1a40bedd.svg',
      },
      {
        title: 'Codacy branch coverage',
        previewUri:
          '/codacy/coverage/c44df2d9c89a4809896914fd1a40bedd/master.svg',
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
        previewUri: '/discourse/https/meta.discourse.org/topics.svg',
      },
      {
        title: 'Discourse posts',
        previewUri: '/discourse/https/meta.discourse.org/posts.svg',
      },
      {
        title: 'Discourse users',
        previewUri: '/discourse/https/meta.discourse.org/users.svg',
      },
      {
        title: 'Discourse likes',
        previewUri: '/discourse/https/meta.discourse.org/likes.svg',
      },
      {
        title: 'Discourse status',
        previewUri: '/discourse/https/meta.discourse.org/status.svg',
      },
      {
        title: 'Gitter',
        previewUri: '/gitter/room/nwjs/nw.js.svg',
      },
      {
        title: 'Discord',
        previewUri: '/discord/102860784329052160.svg',
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
        previewUri: '/depfu/depfu/example-ruby.svg',
      },
      {
        title: 'Hackage-Deps',
        previewUri: '/hackage-deps/v/lens.svg',
      },
      {
        title: 'Requires.io',
        previewUri: '/requires/github/celery/celery.svg',
      },
      {
        title: 'David',
        previewUri: '/david/expressjs/express.svg',
      },
      {
        title: 'David',
        previewUri: '/david/dev/expressjs/express.svg',
      },
      {
        title: 'David',
        previewUri: '/david/optional/elnounch/byebye.svg',
      },
      {
        title: 'David',
        previewUri: '/david/peer/webcomponents/generator-element.svg',
      },
      {
        title: 'David (path)',
        previewUri: '/david/babel/babel.svg?path=packages/babel-core',
      },
      {
        title: 'Libraries.io for releases',
        previewUri: '/librariesio/release/hex/phoenix/1.0.3.svg',
      },
      {
        title: 'Libraries.io for GitHub',
        previewUri: '/librariesio/github/phoenixframework/phoenix.svg',
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
        previewUri: '/github/downloads/atom/atom/total.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'Github Releases',
        previewUri: '/github/downloads/atom/atom/latest/total.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'Github Pre-Releases',
        previewUri: '/github/downloads-pre/atom/atom/latest/total.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'Github Releases (by Release)',
        previewUri: '/github/downloads/atom/atom/v0.190.0/total.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'Github Releases (by Asset)',
        previewUri: '/github/downloads/atom/atom/latest/atom-amd64.deb.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'Github Pre-Releases (by Asset)',
        previewUri: '/github/downloads-pre/atom/atom/latest/atom-amd64.deb.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'Chocolatey',
        previewUri: '/chocolatey/dt/scriptcs.svg',
      },
      {
        title: 'NuGet',
        previewUri: '/nuget/dt/Microsoft.AspNetCore.Mvc.svg',
      },
      {
        title: 'MyGet',
        previewUri: '/myget/mongodb/dt/MongoDB.Driver.Core.svg',
      },
      {
        title: 'MyGet tenant',
        previewUri:
          '/dotnet.myget/dotnet-coreclr/dt/Microsoft.DotNet.CoreCLR.svg',
      },
      {
        title: 'PowerShell Gallery',
        previewUri: '/powershellgallery/dt/ACMESharp.svg',
      },
      {
        title: 'PyPI',
        previewUri: '/pypi/dm/Django.svg',
        keywords: ['python'],
      },
      {
        title: 'PyPI',
        previewUri: '/pypi/dw/Django.svg',
        keywords: ['python'],
      },
      {
        title: 'PyPI',
        previewUri: '/pypi/dd/Django.svg',
        keywords: ['python'],
      },
      {
        title: 'Conda',
        previewUri: '/conda/dn/conda-forge/python.svg',
        keywords: ['conda'],
      },
      {
        title: 'Crates.io',
        previewUri: '/crates/d/rustc-serialize.svg',
        keywords: ['Rust'],
      },
      {
        title: 'Crates.io',
        previewUri: '/crates/dv/rustc-serialize.svg',
        keywords: ['Rust'],
      },
      {
        title: 'Packagist',
        previewUri: '/packagist/dm/doctrine/orm.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Packagist',
        previewUri: '/packagist/dd/doctrine/orm.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Packagist',
        previewUri: '/packagist/dt/doctrine/orm.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Hex.pm',
        previewUri: '/hexpm/dw/plug.svg',
      },
      {
        title: 'Hex.pm',
        previewUri: '/hexpm/dd/plug.svg',
      },
      {
        title: 'Hex.pm',
        previewUri: '/hexpm/dt/plug.svg',
      },
      {
        title: 'WordPress plugin',
        previewUri: '/wordpress/plugin/dt/akismet.svg',
      },
      {
        title: 'WordPress theme',
        previewUri: '/wordpress/theme/dt/hestia.svg',
      },
      {
        title: 'SourceForge',
        previewUri: '/sourceforge/dm/sevenzip.svg',
      },
      {
        title: 'SourceForge',
        previewUri: '/sourceforge/dw/sevenzip.svg',
      },
      {
        title: 'SourceForge',
        previewUri: '/sourceforge/dd/sevenzip.svg',
      },
      {
        title: 'SourceForge',
        previewUri: '/sourceforge/dt/sevenzip.svg',
      },
      {
        title: 'SourceForge',
        previewUri: '/sourceforge/dt/arianne/stendhal.svg',
      },
      {
        title: 'Puppet Forge',
        previewUri: '/puppetforge/dt/camptocamp/openldap.svg',
      },
      {
        title: 'DUB',
        previewUri: '/dub/dd/vibe-d.svg',
        keywords: ['dub'],
      },
      {
        title: 'DUB',
        previewUri: '/dub/dw/vibe-d.svg',
        keywords: ['dub'],
      },
      {
        title: 'DUB',
        previewUri: '/dub/dm/vibe-d/latest.svg',
        keywords: ['dub'],
      },
      {
        title: 'DUB',
        previewUri: '/dub/dt/vibe-d/0.7.23.svg',
        keywords: ['dub'],
      },
      {
        title: 'Package Control',
        previewUri: '/packagecontrol/dm/GitGutter.svg',
        keywords: ['sublime'],
      },
      {
        title: 'Package Control',
        previewUri: '/packagecontrol/dw/GitGutter.svg',
        keywords: ['sublime'],
      },
      {
        title: 'Package Control',
        previewUri: '/packagecontrol/dd/GitGutter.svg',
        keywords: ['sublime'],
      },
      {
        title: 'Package Control',
        previewUri: '/packagecontrol/dt/GitGutter.svg',
        keywords: ['sublime'],
      },
      {
        title: 'CocoaPods',
        previewUri: '/cocoapods/dt/AFNetworking.svg',
        keywords: ['cocoapods'],
      },
      {
        title: 'CocoaPods',
        previewUri: '/cocoapods/dm/AFNetworking.svg',
        keywords: ['cocoapods'],
      },
      {
        title: 'CocoaPods',
        previewUri: '/cocoapods/dw/AFNetworking.svg',
        keywords: ['cocoapods'],
      },
      {
        title: 'Mozilla Add-on',
        previewUri: '/amo/d/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Visual Studio Marketplace',
        previewUri: '/vscode-marketplace/d/ritwickdey.LiveServer.svg',
        keywords: ['vscode-marketplace'],
      },
      {
        title: 'Eclipse Marketplace',
        previewUri: '/eclipse-marketplace/dt/notepad4e.svg',
        keywords: ['eclipse', 'marketplace'],
      },
      {
        title: 'Eclipse Marketplace',
        previewUri: '/eclipse-marketplace/dm/notepad4e.svg',
        keywords: ['eclipse', 'marketplace'],
      },
      {
        title: 'JetBrains IntelliJ plugins',
        previewUri: '/jetbrains/plugin/d/1347-scala.svg',
        keywords: ['jetbrains', 'plugin'],
      },
      {
        title: 'JetBrains ReSharper plugins',
        previewUri: '/resharper/dt/ReSharper.Nuke.svg',
        keywords: ['jetbrains', 'plugin'],
      },
      {
        title: 'Ansible Role',
        previewUri: '/ansible/role/d/3078.svg',
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
        title: 'Gratipay',
        previewUri: '/gratipay/project/shields.svg',
      },
      {
        title: 'Liberapay receiving',
        previewUri: '/liberapay/receives/Changaco.svg',
      },
      {
        title: 'Liberapay giving',
        previewUri: '/liberapay/gives/Changaco.svg',
      },
      {
        title: 'Liberapay patrons',
        previewUri: '/liberapay/patrons/Changaco.svg',
      },
      {
        title: 'Liberapay goal progress',
        previewUri: '/liberapay/goal/Changaco.svg',
      },
      {
        title: 'Bountysource',
        previewUri: '/bountysource/team/mozilla-core/activity.svg',
      },
      {
        title: 'Beerpay',
        previewUri: '/beerpay/hashdog/scrapfy-chrome-extension.svg',
      },
      {
        title: 'Codetally',
        previewUri: '/codetally/triggerman722/colorstrap.svg',
      },
      {
        title: 'Chrome Web Store',
        previewUri:
          '/chrome-web-store/price/nimelepbpejjlbmoobocpfnjhihnpked.svg',
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
        previewUri: '/bugzilla/996038.svg',
        keywords: ['Bugzilla', 'bug'],
        documentation: bugzillaDoc,
      },
      {
        title: 'GitHub issues',
        previewUri: '/github/issues/badges/shields.svg',
        keywords: ['GitHub', 'issue'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issues',
        previewUri: '/github/issues-raw/badges/shields.svg',
        keywords: ['GitHub', 'issue'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull requests',
        previewUri: '/github/issues-pr/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'pullrequest', 'pr'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull requests',
        previewUri: '/github/issues-pr-raw/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'pullrequest', 'pr'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub closed issues',
        previewUri: '/github/issues-closed/badges/shields.svg',
        keywords: ['GitHub', 'issue'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub closed issues',
        previewUri: '/github/issues-closed-raw/badges/shields.svg',
        keywords: ['GitHub', 'issue'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub closed pull requests',
        previewUri: '/github/issues-pr-closed/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'pullrequest', 'pr'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub closed pull requests',
        previewUri: '/github/issues-pr-closed-raw/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'pullrequest', 'pr'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issues by-label',
        previewUri: '/github/issues/badges/shields/service-badge.svg',
        keywords: ['GitHub', 'issue', 'label'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issues by-label',
        previewUri: '/github/issues-raw/badges/shields/service-badge.svg',
        keywords: ['GitHub', 'issue', 'label'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull requests by-label',
        previewUri: '/github/issues-pr/badges/shields/service-badge.svg',
        keywords: ['GitHub', 'pullrequests', 'label'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull requests by-label',
        previewUri: '/github/issues-pr-raw/badges/shields/service-badge.svg',
        keywords: ['GitHub', 'pullrequests', 'label'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request state',
        previewUri: '/github/issues/detail/s/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request title',
        previewUri: '/github/issues/detail/title/badges/shields/1290.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request author',
        previewUri: '/github/issues/detail/u/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request label',
        previewUri: '/github/issues/detail/label/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrqeuest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request comments',
        previewUri: '/github/issues/detail/comments/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request age',
        previewUri: '/github/issues/detail/age/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request last update',
        previewUri: '/github/issues/detail/last-update/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'Bitbucket issues',
        previewUri: '/bitbucket/issues/atlassian/python-bitbucket.svg',
      },
      {
        title: 'Bitbucket issues',
        previewUri: '/bitbucket/issues-raw/atlassian/python-bitbucket.svg',
        keywords: ['Bitbucket'],
      },
      {
        title: 'Bitbucket open pull requests',
        previewUri: '/bitbucket/pr/osrf/gazebo.svg',
      },
      {
        title: 'Bitbucket open pull requests',
        previewUri: '/bitbucket/pr-raw/osrf/gazebo.svg',
        keywords: ['Bitbucket'],
      },
      {
        title: 'JIRA issue',
        previewUri: '/jira/issue/https/issues.apache.org/jira/KAFKA-2896.svg',
      },
      {
        title: 'JIRA sprint completion',
        previewUri: '/jira/sprint/https/jira.spring.io/94.svg',
        documentation: jiraSprintCompletionDoc,
      },
      {
        title: 'Waffle.io',
        previewUri:
          '/waffle/label/evancohen/smart-mirror/status%3A%20in%20progress.svg',
      },
      {
        title: 'Issue Stats',
        previewUri: '/issuestats/i/github/expressjs/express.svg',
      },
      {
        title: 'Issue Stats (long form)',
        previewUri: '/issuestats/i/long/github/expressjs/express.svg',
      },
      {
        title: 'Pull Request Stats',
        previewUri: '/issuestats/p/github/expressjs/express.svg',
      },
      {
        title: 'Pull Request Stats (long form)',
        previewUri: '/issuestats/p/long/github/expressjs/express.svg',
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
        previewUri: '/aur/license/yaourt.svg',
        keywords: ['aur'],
      },
      {
        title: 'GitHub',
        previewUri: '/github/license/mashape/apistatus.svg',
        keywords: ['GitHub', 'license'],
        documentation: githubDoc,
      },
      {
        title: 'Crates.io',
        previewUri: '/crates/l/rustc-serialize.svg',
        keywords: ['Rust'],
      },
      {
        title: 'Packagist',
        previewUri: '/packagist/l/doctrine/orm.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Bower',
        previewUri: '/bower/l/bootstrap.svg',
      },
      {
        title: 'PyPI - License',
        previewUri: '/pypi/l/Django.svg',
        keywords: ['python', 'pypi'],
      },
      {
        title: 'Hex.pm',
        previewUri: '/hexpm/l/plug.svg',
      },
      {
        title: 'CocoaPods',
        previewUri: '/cocoapods/l/AFNetworking.svg',
      },
      {
        title: 'CPAN',
        previewUri: '/cpan/l/Config-Augeas.svg',
        keywords: ['perl'],
      },
      {
        title: 'CRAN',
        previewUri: '/cran/l/devtools.svg',
        keywords: ['R'],
      },
      {
        title: 'CTAN',
        previewUri: '/ctan/l/novel.svg',
        keywords: ['tex'],
      },
      {
        title: 'DUB',
        previewUri: '/dub/l/vibe-d.svg',
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
        previewUri:
          '/chrome-web-store/rating/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        keywords: ['chrome'],
      },
      {
        title: 'Chrome Web Store',
        previewUri:
          '/chrome-web-store/stars/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        keywords: ['chrome'],
      },
      {
        title: 'Chrome Web Store',
        previewUri:
          '/chrome-web-store/rating-count/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        keywords: ['chrome'],
      },
      {
        title: 'AUR',
        previewUri: '/aur/votes/yaourt.svg',
        keywords: ['aur'],
      },
      {
        title: 'Mozilla Add-on',
        previewUri: '/amo/rating/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Mozilla Add-on',
        previewUri: '/amo/stars/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Plugin on redmine.org',
        previewUri:
          '/redmine/plugin/rating/redmine_xlsx_format_issue_exporter.svg',
        keywords: ['redmine', 'plugin'],
      },
      {
        title: 'Plugin on redmine.org',
        previewUri:
          '/redmine/plugin/stars/redmine_xlsx_format_issue_exporter.svg',
        keywords: ['redmine', 'plugin'],
      },
      {
        title: 'Vaadin Directory',
        previewUri: '/vaadin-directory/rating/vaadinvaadin-grid.svg',
        keywords: ['vaadin-directory', 'vaadin directory', 'rating'],
      },
      {
        title: 'Vaadin Directory',
        previewUri: '/vaadin-directory/stars/vaadinvaadin-grid.svg',
        keywords: ['vaadin-directory', 'vaadin directory', 'star', 'stars'],
      },
      {
        title: 'Vaadin Directory',
        previewUri: '/vaadin-directory/rating-count/vaadinvaadin-grid.svg',
        keywords: [
          'vaadin-directory',
          'vaadin directory',
          'rating-count',
          'rating count',
        ],
      },
      {
        title: 'WordPress plugin rating',
        previewUri: '/wordpress/plugin/r/akismet.svg',
      },
      {
        title: 'WordPress theme rating',
        previewUri: '/wordpress/theme/r/hestia.svg',
      },
      {
        title: 'Visual Studio Marketplace',
        previewUri: '/vscode-marketplace/r/ritwickdey.LiveServer.svg',
        keywords: ['vscode-marketplace'],
      },
      {
        title: 'StackExchange',
        previewUri: '/stackexchange/tex/r/951.svg',
      },
      {
        title: 'Docker Stars',
        previewUri: '/docker/stars/_/ubuntu.svg',
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
        previewUri: '/github/forks/badges/shields.svg?style=social&label=Fork',
        documentation: githubDoc,
      },
      {
        title: 'GitHub stars',
        previewUri: '/github/stars/badges/shields.svg?style=social&label=Stars',
        documentation: githubDoc,
      },
      {
        title: 'GitHub watchers',
        previewUri:
          '/github/watchers/badges/shields.svg?style=social&label=Watch',
        documentation: githubDoc,
      },
      {
        title: 'GitHub followers',
        previewUri: '/github/followers/espadrine.svg?style=social&label=Follow',
        documentation: githubDoc,
      },
      {
        title: 'Twitter URL',
        previewUri: '/twitter/url/http/shields.io.svg?style=social',
      },
      {
        title: 'Twitter Follow',
        previewUri: '/twitter/follow/espadrine.svg?style=social&label=Follow',
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
        previewUri: '/bundlephobia/min/react.svg',
        keywords: ['node'],
      },
      {
        title: 'npm bundle size (minified + gzip)',
        previewUri: '/bundlephobia/minzip/react.svg',
        keywords: ['node'],
      },
      {
        title: 'PyPI',
        previewUri: '/pypi/v/nine.svg',
        keywords: ['python'],
      },
      {
        title: 'PyPI - Python Version',
        previewUri: '/pypi/pyversions/Django.svg',
        keywords: ['python', 'pypi'],
      },
      {
        title: 'PyPI - Django Version',
        previewUri: '/pypi/djversions/djangorestframework.svg',
        keywords: ['python', 'pypi', 'django'],
      },
      {
        title: 'Conda',
        previewUri: '/conda/v/conda-forge/python.svg',
        keywords: ['conda'],
      },
      {
        title: 'Conda (channel only)',
        previewUri: '/conda/vn/conda-forge/python.svg',
        keywords: ['conda'],
      },
      {
        title: 'LuaRocks',
        previewUri: '/luarocks/v/mpeterv/luacheck.svg',
        keywords: ['lua'],
      },
      {
        title: 'Hackage',
        previewUri: '/hackage/v/lens.svg',
      },
      {
        title: 'Elm package',
        previewUri: '/elm-package/v/elm-lang/core.svg',
        keywords: ['Elm'],
      },
      {
        title: 'Crates.io',
        previewUri: '/crates/v/rustc-serialize.svg',
        keywords: ['Rust'],
      },
      {
        title: 'Packagist',
        previewUri: '/packagist/v/symfony/symfony.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Packagist Pre Release',
        previewUri: '/packagist/vpre/symfony/symfony.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Bintray',
        previewUri: '/bintray/v/asciidoctor/maven/asciidoctorj.svg',
      },
      {
        title: 'Maven metadata URI',
        previewUri:
          '/maven-metadata/v/http/central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml.svg',
      },
      {
        title: 'CocoaPods',
        previewUri: '/cocoapods/v/AFNetworking.svg',
      },
      {
        title: 'Bower',
        previewUri: '/bower/v/bootstrap.svg',
      },
      {
        title: 'Bower Pre Release',
        previewUri: '/bower/vpre/bootstrap.svg',
      },
      {
        title: 'Pub',
        previewUri: '/pub/v/box2d.svg',
      },
      {
        title: 'Hex.pm',
        previewUri: '/hexpm/v/plug.svg',
      },
      {
        title: 'GitHub tag',
        previewUri: '/github/tag/expressjs/express.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub package version',
        previewUri: '/github/package-json/v/badges/shields.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub manifest version',
        previewUri: '/github/manifest-json/v/RedSparr0w/IndieGala-Helper.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub release',
        previewUri: '/github/release/qubyte/rubidium.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub (pre-)release',
        previewUri: '/github/release/qubyte/rubidium/all.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub commits',
        previewUri: '/github/commits-since/SubtitleEdit/subtitleedit/3.4.7.svg',
        keywords: ['GitHub', 'commit'],
        documentation: githubDoc,
      },
      {
        title: 'Github commits (since latest release)',
        previewUri:
          '/github/commits-since/SubtitleEdit/subtitleedit/latest.svg',
        keywords: ['GitHub', 'commit'],
        documentation: githubDoc,
      },
      {
        title: 'Chef cookbook',
        previewUri: '/cookbook/v/chef-sugar.svg',
      },
      {
        title: 'NuGet',
        previewUri: '/nuget/v/Nuget.Core.svg',
      },
      {
        title: 'NuGet Pre Release',
        previewUri: '/nuget/vpre/Microsoft.AspNet.Mvc.svg',
      },
      {
        title: 'MyGet',
        previewUri: '/myget/mongodb/v/MongoDB.Driver.Core.svg',
      },
      {
        title: 'MyGet Pre Release',
        previewUri: '/myget/yolodev/vpre/YoloDev.Dnx.FSharp.svg',
      },
      {
        title: 'MyGet tenant',
        previewUri:
          '/dotnet.myget/dotnet-coreclr/v/Microsoft.DotNet.CoreCLR.svg',
      },
      {
        title: 'Chocolatey',
        previewUri: '/chocolatey/v/git.svg',
      },
      {
        title: 'PowerShell Gallery',
        previewUri: '/powershellgallery/v/Zyborg.Vault.svg',
      },
      {
        title: 'Puppet Forge',
        previewUri: '/puppetforge/v/vStone/percona.svg',
      },
      {
        title: 'Maven Central',
        previewUri: '/maven-central/v/org.apache.maven/apache-maven.svg',
      },
      {
        title: 'Maven Central with version prefix filter',
        previewUri: '/maven-central/v/org.apache.maven/apache-maven/2.svg',
      },
      {
        title: 'Sonatype Nexus (Releases)',
        previewUri:
          '/nexus/r/https/oss.sonatype.org/com.google.guava/guava.svg',
      },
      {
        title: 'Sonatype Nexus (Snapshots)',
        previewUri:
          '/nexus/s/https/oss.sonatype.org/com.google.guava/guava.svg',
      },
      {
        title: 'WordPress plugin',
        previewUri: '/wordpress/plugin/v/akismet.svg',
      },
      {
        title: 'WordPress',
        previewUri: '/wordpress/v/akismet.svg',
      },
      {
        title: 'CPAN',
        previewUri: '/cpan/v/Config-Augeas.svg',
        keywords: ['perl'],
      },
      {
        title: 'CRAN',
        previewUri: '/cran/v/devtools.svg',
        keywords: ['R'],
      },
      {
        title: 'CTAN',
        previewUri: '/ctan/v/tex.svg',
        keywords: ['tex'],
      },
      {
        title: 'DUB',
        previewUri: '/dub/v/vibe-d.svg',
        keywords: ['dub'],
      },
      {
        title: 'AUR',
        previewUri: '/aur/version/yaourt.svg',
        keywords: ['aur'],
      },
      {
        title: 'Chrome Web Store',
        previewUri: '/chrome-web-store/v/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        keywords: ['chrome'],
      },
      {
        title: 'homebrew',
        previewUri: '/homebrew/v/cake.svg',
      },
      {
        title: 'Mozilla Add-on',
        previewUri: '/amo/v/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Visual Studio Marketplace',
        previewUri: '/vscode-marketplace/v/ritwickdey.LiveServer.svg',
        keywords: ['vscode-marketplace'],
      },
      {
        title: 'Eclipse Marketplace',
        previewUri: '/eclipse-marketplace/v/notepad4e.svg',
        keywords: ['eclipse', 'marketplace'],
      },
      {
        title: 'iTunes App Store',
        previewUri: '/itunes/v/803453959.svg',
        exampleUri: '/itunes/v/BUNDLE_ID.svg',
      },
      {
        title: 'JitPack',
        previewUri: '/jitpack/v/jitpack/maven-simple.svg',
        keywords: ['jitpack', 'java', 'maven'],
      },
      {
        title: 'Jenkins Plugins',
        previewUri: '/jenkins/plugin/v/blueocean.svg',
      },
      {
        title: 'JetBrains IntelliJ Plugins',
        previewUri: '/jetbrains/plugin/v/9630-a8translate.svg',
      },
      {
        title: 'JetBrains ReSharper Plugins',
        previewUri: '/resharper/v/ReSharper.Nuke.svg',
      },
      {
        title: 'JetBrains ReSharper Plugins Pre-release',
        previewUri: '/resharper/vpre/ReSharper.Nuke.svg',
      },
      {
        title: 'PHP from Travis config',
        previewUri: '/travis/php-v/symfony/symfony.svg',
      },
      {
        title: 'PHP from Packagist',
        previewUri: '/packagist/php-v/symfony/symfony.svg',
      },
      {
        title: 'PHP version from PHP-Eye',
        previewUri: '/php-eye/symfony/symfony.svg',
      },
      {
        title: 'Vaadin Directory',
        previewUri: '/vaadin-directory/v/vaadinvaadin-grid.svg',
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
      id: 'monitoring',
      name: 'Monitoring',
    },
    examples: [
      {
        title: 'Website',
        previewUri:
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
        title: 'VersionEye',
        previewUri: '/versioneye/d/ruby/rails.svg',
      },
      {
        title: 'PyPI - Wheel',
        previewUri: '/pypi/wheel/Django.svg',
        keywords: ['python', 'pypi'],
      },
      {
        title: 'PyPI - Format',
        previewUri: '/pypi/format/Django.svg',
        keywords: ['python', 'pypi'],
      },
      {
        title: 'PyPI - Implementation',
        previewUri: '/pypi/implementation/Django.svg',
        keywords: ['python', 'pypi'],
      },
      {
        title: 'PyPI - Status',
        previewUri: '/pypi/status/Django.svg',
        keywords: ['python', 'pypi'],
      },
      {
        title: 'Wheelmap',
        previewUri: '/wheelmap/a/2323004600.svg',
      },
      {
        title: 'GitHub Release Date',
        previewUri: '/github/release-date/SubtitleEdit/subtitleedit.svg',
        keywords: ['GitHub', 'release', 'date'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub (Pre-)Release Date',
        previewUri: '/github/release-date-pre/Cockatrice/Cockatrice.svg',
        keywords: ['GitHub', 'release', 'date'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull request check state',
        previewUri: '/github/status/s/pulls/badges/shields/1110.svg',
        keywords: ['GitHub', 'pullrequest', 'detail', 'check'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull request check contexts',
        previewUri: '/github/status/contexts/pulls/badges/shields/1110.svg',
        keywords: ['GitHub', 'pullrequest', 'detail', 'check'],
        documentation: githubDoc,
      },
      {
        title: 'Github commit merge status',
        previewUri:
          '/github/commit-status/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.svg',
        keywords: ['GitHub', 'commit', 'branch', 'merge'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub contributors',
        previewUri: '/github/contributors/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'contributor'],
        documentation: githubDoc,
      },
      {
        title: 'Github file size',
        previewUri:
          '/github/size/webcaetano/craft/build/phaser-craft.min.js.svg',
        keywords: ['GitHub', 'file', 'size'],
        documentation: githubDoc,
      },
      {
        title: 'Github search hit counter',
        previewUri: '/github/search/torvalds/linux/goto.svg',
        keywords: ['GitHub', 'search', 'hit', 'counter'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub commit activity the past week, 4 weeks, year',
        previewUri: '/github/commit-activity/y/eslint/eslint.svg',
        keywords: ['GitHub', 'commit', 'commits', 'activity'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub last commit',
        previewUri: '/github/last-commit/google/skia.svg',
        keywords: ['GitHub', 'last', 'latest', 'commit'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub last commit (branch)',
        previewUri: '/github/last-commit/google/skia/infra/config.svg',
        keywords: ['GitHub', 'last', 'latest', 'commit'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub top language',
        previewUri: '/github/languages/top/badges/shields.svg',
        keywords: ['GitHub', 'top', 'language'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub language count',
        previewUri: '/github/languages/count/badges/shields.svg',
        keywords: ['GitHub', 'language', 'count'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub code size in bytes',
        previewUri: '/github/languages/code-size/badges/shields.svg',
        keywords: ['GitHub', 'byte', 'code', 'size'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub repo size in bytes',
        previewUri: '/github/repo-size/badges/shields.svg',
        keywords: ['GitHub', 'repo', 'size'],
        documentation: githubDoc,
      },
      {
        title: 'Libscore',
        previewUri: '/libscore/s/jQuery.svg',
      },
      {
        title: 'Puppet Forge',
        previewUri: '/puppetforge/e/camptocamp/openssl.svg',
      },
      {
        title: 'Puppet Forge',
        previewUri: '/puppetforge/f/camptocamp/openssl.svg',
      },
      {
        title: 'Puppet Forge',
        previewUri: '/puppetforge/rc/camptocamp.svg',
      },
      {
        title: 'Puppet Forge',
        previewUri: '/puppetforge/mc/camptocamp.svg',
      },
      {
        title: 'Docker Pulls',
        previewUri: '/docker/pulls/mashape/kong.svg',
        keywords: ['docker', 'pulls'],
      },
      {
        title: 'Docker Automated build',
        previewUri: '/docker/automated/jrottenberg/ffmpeg.svg',
        keywords: ['docker', 'automated', 'build'],
      },
      {
        title: 'Docker Build Status',
        previewUri: '/docker/build/jrottenberg/ffmpeg.svg',
        keywords: ['docker', 'build', 'status'],
      },
      {
        title: 'ImageLayers Size',
        previewUri: '/imagelayers/image-size/_/ubuntu/latest.svg',
        keywords: ['imagelayers'],
      },
      {
        title: 'ImageLayers Layers',
        previewUri: '/imagelayers/layers/_/ubuntu/latest.svg',
        keywords: ['imagelayers'],
      },
      {
        title: 'MicroBadger Size',
        previewUri: '/microbadger/image-size/fedora/apache.svg',
        keywords: ['docker'],
      },
      {
        title: 'MicroBadger Size (tag)',
        previewUri: '/microbadger/image-size/_/httpd/alpine.svg',
        keywords: ['docker'],
      },
      {
        title: 'MicroBadger Layers',
        previewUri: '/microbadger/layers/_/httpd.svg',
        keywords: ['docker'],
      },
      {
        title: 'MicroBadger Layers (tag)',
        previewUri: '/microbadger/layers/_/httpd/alpine.svg',
        keywords: ['docker'],
      },
      {
        title: 'Maintenance',
        previewUri: '/maintenance/yes/2017.svg',
      },
      {
        title: 'Chrome Web Store',
        previewUri:
          '/chrome-web-store/users/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        keywords: ['chrome'],
      },
      {
        title: 'Mozilla Add-on',
        previewUri: '/amo/users/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Swagger Validator',
        previewUri:
          '/swagger/valid/2.0/https/raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/petstore-expanded.json.svg',
      },
      {
        title: 'Eclipse Marketplace',
        previewUri: '/eclipse-marketplace/favorites/notepad4e.svg',
        keywords: ['eclipse', 'marketplace'],
      },
      {
        title: 'Eclipse Marketplace',
        previewUri: '/eclipse-marketplace/last-update/notepad4e.svg',
        keywords: ['eclipse', 'marketplace'],
      },
      {
        title: 'Vaadin Directory',
        previewUri: '/vaadin-directory/status/vaadinvaadin-grid.svg',
        keywords: ['vaadin-directory', 'vaadin directory', 'status'],
      },
      {
        title: 'Vaadin Directory',
        previewUri: '/vaadin-directory/release-date/vaadinvaadin-grid.svg',
        keywords: [
          'vaadin-directory',
          'vaadin directory',
          'date',
          'latest release date',
        ],
      },
      {
        title: 'CocoaPods',
        previewUri: '/cocoapods/at/AFNetworking.svg',
      },
      {
        title: 'CocoaPods',
        previewUri: '/cocoapods/aw/AFNetworking.svg',
      },
      {
        title: 'CocoaPods',
        previewUri: '/cocoapods/p/AFNetworking.svg',
      },
      {
        title: 'CocoaPods',
        previewUri: '/cocoapods/metrics/doc-percent/AFNetworking.svg',
      },
      {
        title: 'Conda',
        previewUri: '/conda/pn/conda-forge/python.svg',
        keywords: ['conda'],
      },
      {
        title: 'Ansible Role',
        previewUri: '/ansible/role/3078.svg',
      },
      {
        title: 'StackExchange',
        previewUri: '/stackexchange/stackoverflow/t/augeas.svg',
      },
      {
        title: 'NetflixOSS Lifecycle',
        previewUri: '/osslifecycle/Netflix/osstracker.svg',
      },
      {
        title: 'Sourcegraph for Repo Reference Count',
        previewUri: '/sourcegraph/rrc/github.com/gorilla/mux.svg',
      },
      {
        title: 'SemVer Compatibility',
        previewUri: '/dependabot/semver/bundler/puma.svg',
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
    const category = findCategory(ServiceClass.category)
    if (category === undefined) {
      if (ServiceClass.category === 'debug') {
        // we don't want to show debug services on the examples page
        return
      }
      throw Error(
        `Unknown category ${ServiceClass.category} referenced in ${
          ServiceClass.name
        }`
      )
    }
    const prepared = ServiceClass.prepareExamples()
    category.examples = category.examples.concat(prepared)
  })
}
loadExamples()

module.exports = allBadgeExamples
module.exports.findCategory = findCategory
