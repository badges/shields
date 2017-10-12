'use strict';

const allBadgeExamples = [
  {
    sectionId: 'build',
    sectionName: 'Build',
    badges: [
      {
        title: 'Travis',
        previewBadgeUri: '/travis/rust-lang/rust.svg',
        exampleBadgeUri: 'https://img.shields.io/travis/USER/REPO.svg'
      },
      {
        title: 'Travis branch',
        previewBadgeUri: '/travis/rust-lang/rust/master.svg',
        exampleBadgeUri: 'https://img.shields.io/travis/USER/REPO/BRANCH.svg'
      },
      {
        title: 'Wercker',
        previewBadgeUri: '/wercker/ci/wercker/docs.svg',
        exampleBadgeUri: 'https://img.shields.io/wercker/ci/wercker/docs.svg'
      },
      {
        title: 'TeamCity CodeBetter',
        previewBadgeUri: '/teamcity/codebetter/bt428.svg',
        exampleBadgeUri: 'https://img.shields.io/teamcity/codebetter/bt428.svg'
      },
      {
        title: 'TeamCity (simple build status)',
        previewBadgeUri: '/teamcity/http/teamcity.jetbrains.com/s/bt345.svg',
        exampleBadgeUri: 'https://img.shields.io/teamcity/http/teamcity.jetbrains.com/s/bt345.svg'
      },
      {
        title: '(full build status)',
        exampleBadgeUri: 'https://img.shields.io/teamcity/http/teamcity.jetbrains.com/e/bt345.svg',
        keywords: [
          'teamcity'
        ]
      },
      {
        title: 'AppVeyor',
        previewBadgeUri: '/appveyor/ci/gruntjs/grunt.svg',
        exampleBadgeUri: 'https://img.shields.io/appveyor/ci/gruntjs/grunt.svg'
      },
      {
        title: 'AppVeyor branch',
        previewBadgeUri: '/appveyor/ci/gruntjs/grunt/master.svg',
        exampleBadgeUri: 'https://img.shields.io/appveyor/ci/gruntjs/grunt/master.svg'
      },
      {
        title: 'AppVeyor tests',
        previewBadgeUri: '/appveyor/tests/NZSmartie/coap-net-iu0to.svg',
        exampleBadgeUri: 'https://img.shields.io/appveyor/tests/NZSmartie/coap-net-iu0to.svg'
      },
      {
        title: 'AppVeyor tests branch',
        previewBadgeUri: '/appveyor/tests/NZSmartie/coap-net-iu0to/master.svg',
        exampleBadgeUri: 'https://img.shields.io/appveyor/tests/NZSmartie/coap-net-iu0to.svg'
      },
      {
        title: 'Codeship',
        previewBadgeUri: '/codeship/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1.svg',
        exampleBadgeUri: 'https://img.shields.io/codeship/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1.svg'
      },
      {
        title: 'Codeship',
        previewBadgeUri: '/codeship/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1/master.svg',
        exampleBadgeUri: 'https://img.shields.io/codeship/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1/master.svg'
      },
      {
        title: 'Magnum CI',
        previewBadgeUri: '/magnumci/ci/96ffb83fa700f069024921b0702e76ff.svg',
        exampleBadgeUri: 'https://img.shields.io/magnumci/ci/96ffb83fa700f069024921b0702e76ff.svg'
      },
      {
        title: 'Magnum CI',
        previewBadgeUri: '/magnumci/ci/96ffb83fa700f069024921b0702e76ff/new-meta.svg',
        exampleBadgeUri: 'https://img.shields.io/magnumci/ci/96ffb83fa700f069024921b0702e76ff/new-meta.svg'
      },
      {
        title: 'CircleCI',
        previewBadgeUri: '/circleci/project/github/RedSparr0w/node-csgo-parser.svg',
        exampleBadgeUri: 'https://img.shields.io/circleci/project/github/RedSparr0w/node-csgo-parser.svg'
      },
      {
        title: 'CircleCI branch',
        previewBadgeUri: '/circleci/project/github/RedSparr0w/node-csgo-parser/master.svg',
        exampleBadgeUri: 'https://img.shields.io/circleci/project/github/RedSparr0w/node-csgo-parser/master.svg'
      },
      {
        title: 'CircleCI token',
        previewBadgeUri: '/circleci/project/github/RedSparr0w/node-csgo-parser/master.svg',
        exampleBadgeUri: 'https://img.shields.io/circleci/token/YOURTOKEN/project/github/RedSparr0w/node-csgo-parser/master.svg'
      },
      {
        title: 'Visual Studio Team services',
        previewBadgeUri: '/vso/build/larsbrinkhoff/953a34b9-5966-4923-a48a-c41874cfb5f5/1.svg',
        exampleBadgeUri: 'https://img.shields.io/vso/build/larsbrinkhoff/953a34b9-5966-4923-a48a-c41874cfb5f5/1.svg',
        documentation: 'visualStudioTeamServices'
      },
      {
        title: 'Shippable',
        previewBadgeUri: '/shippable/5444c5ecb904a4b21567b0ff.svg',
        exampleBadgeUri: 'https://img.shields.io/shippable/5444c5ecb904a4b21567b0ff.svg'
      },
      {
        title: 'Shippable branch',
        previewBadgeUri: '/shippable/5444c5ecb904a4b21567b0ff/master.svg',
        exampleBadgeUri: 'https://img.shields.io/shippable/5444c5ecb904a4b21567b0ff/master.svg'
      },
      {
        title: 'Snap CI branch',
        previewBadgeUri: '/snap-ci/ThoughtWorksStudios/eb_deployer/master.svg',
        exampleBadgeUri: 'https://img.shields.io/snap-ci/ThoughtWorksStudios/eb_deployer/master.svg'
      },
      {
        title: 'Jenkins',
        previewBadgeUri: '/jenkins/s/https/jenkins.qa.ubuntu.com/view/Precise/view/All%20Precise/job/precise-desktop-amd64_default.svg',
        exampleBadgeUri: 'https://img.shields.io/jenkins/s/https/jenkins.qa.ubuntu.com/view/Precise/view/All%20Precise/job/precise-desktop-amd64_default.svg'
      },
      {
        title: 'Jenkins tests',
        previewBadgeUri: '/jenkins/t/https/jenkins.qa.ubuntu.com/view/Precise/view/All%20Precise/job/precise-desktop-amd64_default.svg',
        exampleBadgeUri: 'https://img.shields.io/jenkins/t/https/jenkins.qa.ubuntu.com/view/Precise/view/All%20Precise/job/precise-desktop-amd64_default.svg'
      },
      {
        title: 'Jenkins coverage',
        previewBadgeUri: '/jenkins/c/https/jenkins.qa.ubuntu.com/view/Utopic/view/All/job/address-book-service-utopic-i386-ci.svg',
        exampleBadgeUri: 'https://img.shields.io/jenkins/c/https/jenkins.qa.ubuntu.com/view/Utopic/view/All/job/address-book-service-utopic-i386-ci.svg'
      },
      {
        title: 'Coveralls',
        previewBadgeUri: '/coveralls/jekyll/jekyll.svg',
        exampleBadgeUri: 'https://img.shields.io/coveralls/jekyll/jekyll.svg'
      },
      {
        title: 'Coveralls branch',
        previewBadgeUri: '/coveralls/jekyll/jekyll/master.svg',
        exampleBadgeUri: 'https://img.shields.io/coveralls/jekyll/jekyll/master.svg'
      },
      {
        title: 'SonarQube Coverage',
        previewBadgeUri: '/sonar/http/sonar.qatools.ru/ru.yandex.qatools.allure:allure-core/coverage.svg',
        exampleBadgeUri: 'https://img.shields.io/sonar/http/sonar.qatools.ru/ru.yandex.qatools.allure:allure-core/coverage.svg'
      },
      {
        title: 'SonarQube Tech Debt',
        previewBadgeUri: '/sonar/http/sonar.qatools.ru/ru.yandex.qatools.allure:allure-core/tech_debt.svg',
        exampleBadgeUri: 'https://img.shields.io/sonar/http/sonar.qatools.ru/ru.yandex.qatools.allure:allure-core/tech_debt.svg'
      },
      {
        title: 'TeamCity CodeBetter Coverage',
        previewBadgeUri: '/teamcity/coverage/bt1242.svg',
        exampleBadgeUri: 'https://img.shields.io/teamcity/coverage/bt1242.svg'
      },
      {
        title: 'Scrutinizer',
        previewBadgeUri: '/scrutinizer/g/filp/whoops.svg',
        exampleBadgeUri: 'https://img.shields.io/scrutinizer/g/filp/whoops.svg'
      },
      {
        title: 'Scrutinizer Coverage',
        previewBadgeUri: '/scrutinizer/coverage/g/filp/whoops.svg',
        exampleBadgeUri: 'https://img.shields.io/scrutinizer/coverage/g/filp/whoops.svg'
      },
      {
        title: 'Scrutinizer branch',
        previewBadgeUri: '/scrutinizer/coverage/g/phpmyadmin/phpmyadmin/master.svg',
        exampleBadgeUri: 'https://img.shields.io/scrutinizer/coverage/g/phpmyadmin/phpmyadmin/master.svg'
      },
      {
        title: 'Scrutinizer Build',
        previewBadgeUri: '/scrutinizer/build/g/filp/whoops.svg',
        exampleBadgeUri: 'https://img.shields.io/scrutinizer/build/g/filp/whoops.svg'
      },
      {
        title: 'Codecov',
        previewBadgeUri: '/codecov/c/github/codecov/example-python.svg',
        exampleBadgeUri: 'https://img.shields.io/codecov/c/github/codecov/example-python.svg'
      },
      {
        title: 'Codecov branch',
        previewBadgeUri: '/codecov/c/github/codecov/example-python/master.svg',
        exampleBadgeUri: 'https://img.shields.io/codecov/c/github/codecov/example-python/master.svg'
      },
      {
        title: 'Codecov private',
        previewBadgeUri: '/codecov/c/github/codecov/example-python.svg',
        exampleBadgeUri: 'https://img.shields.io/codecov/c/token/YOURTOKEN/github/codecov/example-python.svg'
      },
      {
        title: 'Coverity Scan',
        previewBadgeUri: '/coverity/scan/3997.svg',
        exampleBadgeUri: 'https://img.shields.io/coverity/scan/3997.svg'
      },
      {
        title: 'Coverity Code Advisor On Demand Stream Badge',
        previewBadgeUri: '/coverity/ondemand/streams/STREAM.svg',
        exampleBadgeUri: 'https://img.shields.io/coverity/ondemand/streams/STREAM.svg'
      },
      {
        title: 'Coverity Code Advisor On Demand Job Badge',
        previewBadgeUri: '/coverity/ondemand/jobs/JOB.svg',
        exampleBadgeUri: 'https://img.shields.io/coverity/ondemand/jobs/JOB.svg'
      },
      {
        title: 'HHVM',
        previewBadgeUri: '/hhvm/symfony/symfony.svg',
        exampleBadgeUri: 'https://img.shields.io/hhvm/symfony/symfony.svg'
      },
      {
        title: 'HHVM (branch)',
        previewBadgeUri: '/hhvm/symfony/symfony/master.svg',
        exampleBadgeUri: 'https://img.shields.io/hhvm/symfony/symfony/master.svg'
      },
      {
        title: 'SensioLabs Insight',
        previewBadgeUri: '/sensiolabs/i/45afb680-d4e6-4e66-93ea-bcfa79eb8a87.svg',
        exampleBadgeUri: 'https://img.shields.io/sensiolabs/i/45afb680-d4e6-4e66-93ea-bcfa79eb8a87.svg'
      },
      {
        title: 'Dockbit',
        previewBadgeUri: '/dockbit/DockbitStatus/health.svg?token=TvavttxFHJ4qhnKstDxrvBXM',
        exampleBadgeUri: 'https://img.shields.io/dockbit/ORGANIZATION_NAME/PIPELINE_NAME.svg?token=PIPELINE_TOKEN'
      },
      {
        title: 'continuousphp',
        previewBadgeUri: '/continuousphp/git-hub/doctrine/dbal/master.svg',
        exampleBadgeUri: 'https://img.shields.io/continuousphp/git-hub/doctrine/dbal/master.svg'
      },
      {
        title: 'Read the Docs',
        previewBadgeUri: '/readthedocs/pip.svg',
        exampleBadgeUri: 'https://img.shields.io/readthedocs/pip.svg',
        keywords: [
          'documentation'
        ]
      },
      {
        title: 'Read the Docs (version)',
        previewBadgeUri: '/readthedocs/pip/stable.svg',
        exampleBadgeUri: 'https://img.shields.io/readthedocs/pip/stable.svg',
        keywords: [
          'documentation'
        ]
      }
    ]
  },
  {
    sectionId: 'downloads',
    sectionName: 'Downloads',
    badges: [
      {
        title: 'Github All Releases',
        previewBadgeUri: '/github/downloads/atom/atom/total.svg',
        exampleBadgeUri: 'https://img.shields.io/github/downloads/atom/atom/total.svg',
        keywords: [
          'github'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'Github Releases',
        previewBadgeUri: '/github/downloads/atom/atom/latest/total.svg',
        exampleBadgeUri: 'https://img.shields.io/github/downloads/atom/atom/latest/total.svg',
        keywords: [
          'github'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'Github Pre-Releases',
        previewBadgeUri: '/github/downloads-pre/atom/atom/latest/total.svg',
        exampleBadgeUri: 'https://img.shields.io/github/downloads-pre/atom/atom/latest/total.svg',
        keywords: [
          'github'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'Github Releases (by Release)',
        previewBadgeUri: '/github/downloads/atom/atom/v0.190.0/total.svg',
        exampleBadgeUri: 'https://img.shields.io/github/downloads/atom/atom/v0.190.0/total.svg',
        keywords: [
          'github'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'Github Releases (by Asset)',
        previewBadgeUri: '/github/downloads/atom/atom/latest/atom-amd64.deb.svg',
        exampleBadgeUri: 'https://img.shields.io/github/downloads/atom/atom/latest/atom-amd64.deb.svg',
        keywords: [
          'github'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'Github Pre-Releases (by Asset)',
        previewBadgeUri: '/github/downloads-pre/atom/atom/latest/atom-amd64.deb.svg',
        exampleBadgeUri: 'https://img.shields.io/github/downloads-pre/atom/atom/latest/atom-amd64.deb.svg',
        keywords: [
          'github'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'npm',
        previewBadgeUri: '/npm/dw/localeval.svg',
        exampleBadgeUri: 'https://img.shields.io/npm/dw/localeval.svg',
        keywords: [
          'node'
        ]
      },
      {
        title: 'npm',
        previewBadgeUri: '/npm/dm/localeval.svg',
        exampleBadgeUri: 'https://img.shields.io/npm/dm/localeval.svg',
        keywords: [
          'node'
        ]
      },
      {
        title: 'npm',
        previewBadgeUri: '/npm/dy/localeval.svg',
        exampleBadgeUri: 'https://img.shields.io/npm/dy/localeval.svg',
        keywords: [
          'node'
        ]
      },
      {
        title: 'npm',
        previewBadgeUri: '/npm/dt/express.svg',
        exampleBadgeUri: 'https://img.shields.io/npm/dt/express.svg',
        keywords: [
          'node'
        ]
      },
      {
        title: 'Gem',
        previewBadgeUri: '/gem/dv/rails/stable.svg',
        exampleBadgeUri: 'https://img.shields.io/gem/dv/rails/stable.svg',
        keywords: [
          'ruby'
        ]
      },
      {
        title: 'Gem',
        previewBadgeUri: '/gem/dv/rails/4.1.0.svg',
        exampleBadgeUri: 'https://img.shields.io/gem/dv/rails/4.1.0.svg',
        keywords: [
          'ruby'
        ]
      },
      {
        title: 'Gem',
        previewBadgeUri: '/gem/dtv/rails.svg',
        exampleBadgeUri: 'https://img.shields.io/gem/dtv/rails.svg',
        keywords: [
          'ruby'
        ]
      },
      {
        title: 'Gem',
        previewBadgeUri: '/gem/dt/rails.svg',
        exampleBadgeUri: 'https://img.shields.io/gem/dt/rails.svg',
        keywords: [
          'ruby'
        ]
      },
      {
        title: 'Chocolatey',
        previewBadgeUri: '/chocolatey/dt/scriptcs.svg',
        exampleBadgeUri: 'https://img.shields.io/chocolatey/dt/scriptcs.svg'
      },
      {
        title: 'NuGet',
        previewBadgeUri: '/nuget/dt/Microsoft.AspNetCore.Mvc.svg',
        exampleBadgeUri: 'https://img.shields.io/nuget/dt/Microsoft.AspNetCore.Mvc.svg'
      },
      {
        title: 'MyGet',
        previewBadgeUri: '/myget/mongodb/dt/MongoDB.Driver.Core.svg',
        exampleBadgeUri: 'https://img.shields.io/myget/mongodb/dt/MongoDB.Driver.Core.svg'
      },
      {
        title: 'MyGet tenant',
        previewBadgeUri: '/dotnet.myget/dotnet-coreclr/dt/Microsoft.DotNet.CoreCLR.svg',
        exampleBadgeUri: 'https://img.shields.io/dotnet.myget/dotnet-coreclr/dt/Microsoft.DotNet.CoreCLR.svg'
      },
      {
        title: 'PowerShell Gallery',
        previewBadgeUri: '/powershellgallery/dt/ACMESharp.svg',
        exampleBadgeUri: 'https://img.shields.io/powershellgallery/dt/ACMESharp.svg'
      },
      {
        title: 'PyPI',
        previewBadgeUri: '/pypi/dm/Django.svg',
        exampleBadgeUri: 'https://img.shields.io/pypi/dm/Django.svg',
        keywords: [
          'python'
        ]
      },
      {
        title: 'PyPI',
        previewBadgeUri: '/pypi/dw/Django.svg',
        exampleBadgeUri: 'https://img.shields.io/pypi/dw/Django.svg',
        keywords: [
          'python'
        ]
      },
      {
        title: 'PyPI',
        previewBadgeUri: '/pypi/dd/Django.svg',
        exampleBadgeUri: 'https://img.shields.io/pypi/dd/Django.svg',
        keywords: [
          'python'
        ]
      },
      {
        title: 'Conda',
        previewBadgeUri: '/conda/dn/conda-forge/python.svg',
        exampleBadgeUri: 'https://img.shields.io/conda/dn/conda-forge/python.svg',
        keywords: [
          'conda'
        ]
      },
      {
        title: 'Crates.io',
        previewBadgeUri: '/crates/d/rustc-serialize.svg',
        exampleBadgeUri: 'https://img.shields.io/crates/d/rustc-serialize.svg',
        keywords: [
          'Rust'
        ]
      },
      {
        title: 'Crates.io',
        previewBadgeUri: '/crates/dv/rustc-serialize.svg',
        exampleBadgeUri: 'https://img.shields.io/crates/dv/rustc-serialize.svg',
        keywords: [
          'Rust'
        ]
      },
      {
        title: 'Packagist',
        previewBadgeUri: '/packagist/dm/doctrine/orm.svg',
        exampleBadgeUri: 'https://img.shields.io/packagist/dm/doctrine/orm.svg',
        keywords: [
          'PHP'
        ]
      },
      {
        title: 'Packagist',
        previewBadgeUri: '/packagist/dd/doctrine/orm.svg',
        exampleBadgeUri: 'https://img.shields.io/packagist/dd/doctrine/orm.svg',
        keywords: [
          'PHP'
        ]
      },
      {
        title: 'Packagist',
        previewBadgeUri: '/packagist/dt/doctrine/orm.svg',
        exampleBadgeUri: 'https://img.shields.io/packagist/dt/doctrine/orm.svg',
        keywords: [
          'PHP'
        ]
      },
      {
        title: 'Hex.pm',
        previewBadgeUri: '/hexpm/dw/plug.svg',
        exampleBadgeUri: 'https://img.shields.io/hexpm/dw/plug.svg'
      },
      {
        title: 'Hex.pm',
        previewBadgeUri: '/hexpm/dd/plug.svg',
        exampleBadgeUri: 'https://img.shields.io/hexpm/dd/plug.svg'
      },
      {
        title: 'Hex.pm',
        previewBadgeUri: '/hexpm/dt/plug.svg',
        exampleBadgeUri: 'https://img.shields.io/hexpm/dt/plug.svg'
      },
      {
        title: 'WordPress plugin',
        previewBadgeUri: '/wordpress/plugin/dt/akismet.svg',
        exampleBadgeUri: 'https://img.shields.io/wordpress/plugin/dt/akismet.svg'
      },
      {
        title: 'WordPress theme',
        previewBadgeUri: '/wordpress/theme/dt/hestia.svg',
        exampleBadgeUri: 'https://img.shields.io/wordpress/theme/dt/hestia.svg'
      },
      {
        title: 'SourceForge',
        previewBadgeUri: '/sourceforge/dm/sevenzip.svg',
        exampleBadgeUri: 'https://img.shields.io/sourceforge/dm/sevenzip.svg'
      },
      {
        title: 'SourceForge',
        previewBadgeUri: '/sourceforge/dw/sevenzip.svg',
        exampleBadgeUri: 'https://img.shields.io/sourceforge/dw/sevenzip.svg'
      },
      {
        title: 'SourceForge',
        previewBadgeUri: '/sourceforge/dd/sevenzip.svg',
        exampleBadgeUri: 'https://img.shields.io/sourceforge/dd/sevenzip.svg'
      },
      {
        title: 'SourceForge',
        previewBadgeUri: '/sourceforge/dt/sevenzip.svg',
        exampleBadgeUri: 'https://img.shields.io/sourceforge/dt/sevenzip.svg'
      },
      {
        title: 'SourceForge',
        previewBadgeUri: '/sourceforge/dt/arianne/stendhal.svg',
        exampleBadgeUri: 'https://img.shields.io/sourceforge/dt/arianne/stendhal.svg'
      },
      {
        title: 'apm',
        previewBadgeUri: '/apm/dm/vim-mode.svg',
        exampleBadgeUri: 'https://img.shields.io/apm/dm/vim-mode.svg',
        keywords: [
          'atom'
        ]
      },
      {
        title: 'Puppet Forge',
        previewBadgeUri: '/puppetforge/dt/camptocamp/openldap.svg',
        exampleBadgeUri: 'https://img.shields.io/puppetforge/dt/camptocamp/openldap.svg'
      },
      {
        title: 'DUB',
        previewBadgeUri: '/dub/dd/vibe-d.svg',
        exampleBadgeUri: 'https://img.shields.io/dub/dd/vibe-d.svg',
        keywords: [
          'dub'
        ]
      },
      {
        title: 'DUB',
        previewBadgeUri: '/dub/dw/vibe-d.svg',
        exampleBadgeUri: 'https://img.shields.io/dub/dw/vibe-d.svg',
        keywords: [
          'dub'
        ]
      },
      {
        title: 'DUB',
        previewBadgeUri: '/dub/dm/vibe-d/latest.svg',
        exampleBadgeUri: 'https://img.shields.io/dub/dm/vibe-d/latest.svg',
        keywords: [
          'dub'
        ]
      },
      {
        title: 'DUB',
        previewBadgeUri: '/dub/dt/vibe-d/0.7.23.svg',
        exampleBadgeUri: 'https://img.shields.io/dub/dt/vibe-d/0.7.23.svg',
        keywords: [
          'dub'
        ]
      },
      {
        title: 'Package Control',
        previewBadgeUri: '/packagecontrol/dm/GitGutter.svg',
        exampleBadgeUri: 'https://img.shields.io/packagecontrol/dm/GitGutter.svg',
        keywords: [
          'sublime'
        ]
      },
      {
        title: 'Package Control',
        previewBadgeUri: '/packagecontrol/dw/GitGutter.svg',
        exampleBadgeUri: 'https://img.shields.io/packagecontrol/dw/GitGutter.svg',
        keywords: [
          'sublime'
        ]
      },
      {
        title: 'Package Control',
        previewBadgeUri: '/packagecontrol/dd/GitGutter.svg',
        exampleBadgeUri: 'https://img.shields.io/packagecontrol/dd/GitGutter.svg',
        keywords: [
          'sublime'
        ]
      },
      {
        title: 'Package Control',
        previewBadgeUri: '/packagecontrol/dt/GitGutter.svg',
        exampleBadgeUri: 'https://img.shields.io/packagecontrol/dt/GitGutter.svg',
        keywords: [
          'sublime'
        ]
      },
      {
        title: 'Website',
        previewBadgeUri: '/website-up-down-green-red/http/shields.io.svg?label=my-website',
        exampleBadgeUri: 'https://img.shields.io/website-up-down-green-red/http/shields.io.svg?label=my-website',
        keywords: [
          'website'
        ],
        documentation: 'websiteDoc'
      },
      {
        title: 'CocoaPods',
        previewBadgeUri: '/cocoapods/dt/AFNetworking.svg',
        exampleBadgeUri: 'https://img.shields.io/cocoapods/dt/AFNetworking.svg',
        keywords: [
          'cocoapods'
        ]
      },
      {
        title: 'CocoaPods',
        previewBadgeUri: '/cocoapods/dm/AFNetworking.svg',
        exampleBadgeUri: 'https://img.shields.io/cocoapods/dm/AFNetworking.svg',
        keywords: [
          'cocoapods'
        ]
      },
      {
        title: 'CocoaPods',
        previewBadgeUri: '/cocoapods/dw/AFNetworking.svg',
        exampleBadgeUri: 'https://img.shields.io/cocoapods/dw/AFNetworking.svg',
        keywords: [
          'cocoapods'
        ]
      },
      {
        title: 'Mozilla Add-on',
        previewBadgeUri: '/amo/d/dustman.svg',
        exampleBadgeUri: 'https://img.shields.io/amo/d/dustman.svg',
        keywords: [
          'amo',
          'firefox'
        ]
      },
      {
        title: 'Visual Studio Marketplace',
        previewBadgeUri: '/vscode-marketplace/d/ritwickdey.LiveServer.svg',
        exampleBadgeUri: 'https://img.shields.io/vscode-marketplace/d/ritwickdey.LiveServer.svg',
        keywords: [
          'vscode-marketplace'
        ]
      },
      {
        title: 'JetBrains plugins',
        previewBadgeUri: '/jetbrains/plugin/d/1347-scala.svg',
        exampleBadgeUri: 'https://img.shields.io/jetbrains/plugin/d/1347-scala.svg',
        keywords: [
          'jetbrains',
          'plugin'
        ]
      },
      {
        title: 'Ansible Role',
        previewBadgeUri: '/ansible/role/d/3078.svg',
        exampleBadgeUri: 'https://img.shields.io/ansible/role/d/3078.svg'
      }
    ]
  },
  {
    sectionId: 'version',
    sectionName: 'Version',
    badges: [
      {
        title: 'CDNJS',
        previewBadgeUri: '/cdnjs/v/jquery.svg',
        exampleBadgeUri: 'https://img.shields.io/cdnjs/v/jquery.svg',
        keywords: [
          'cdn',
          'cdnjs'
        ]
      },
      {
        title: 'npm',
        previewBadgeUri: '/npm/v/npm.svg',
        exampleBadgeUri: 'https://img.shields.io/npm/v/npm.svg',
        keywords: [
          'node'
        ]
      },
      {
        title: 'npm (scoped)',
        previewBadgeUri: '/npm/v/@cycle/core.svg',
        exampleBadgeUri: 'https://img.shields.io/npm/v/@cycle/core.svg',
        keywords: [
          'node'
        ]
      },
      {
        title: 'npm (tag)',
        previewBadgeUri: '/npm/v/npm/next.svg',
        exampleBadgeUri: 'https://img.shields.io/npm/v/npm/next.svg',
        keywords: [
          'node'
        ]
      },
      {
        title: 'npm (scoped with tag)',
        previewBadgeUri: '/npm/v/@cycle/core/canary.svg',
        exampleBadgeUri: 'https://img.shields.io/npm/v/@cycle/core/canary.svg',
        keywords: [
          'node'
        ]
      },
      {
        title: 'node',
        previewBadgeUri: '/node/v/gh-badges.svg',
        exampleBadgeUri: 'https://img.shields.io/node/v/gh-badges.svg'
      },
      {
        title: 'PyPI',
        previewBadgeUri: '/pypi/v/nine.svg',
        exampleBadgeUri: 'https://img.shields.io/pypi/v/nine.svg',
        keywords: [
          'python'
        ]
      },
      {
        title: 'Conda',
        previewBadgeUri: '/conda/v/conda-forge/python.svg',
        exampleBadgeUri: 'https://img.shields.io/conda/v/conda-forge/python.svg',
        keywords: [
          'conda'
        ]
      },
      {
        title: 'Conda (channel only)',
        previewBadgeUri: '/conda/vn/conda-forge/python.svg',
        exampleBadgeUri: 'https://img.shields.io/conda/vn/conda-forge/python.svg',
        keywords: [
          'conda'
        ]
      },
      {
        title: 'Gem',
        previewBadgeUri: '/gem/v/formatador.svg',
        exampleBadgeUri: 'https://img.shields.io/gem/v/formatador.svg',
        keywords: [
          'ruby'
        ]
      },
      {
        title: 'LuaRocks',
        previewBadgeUri: '/luarocks/v/mpeterv/luacheck.svg',
        exampleBadgeUri: 'https://img.shields.io/luarocks/v/mpeterv/luacheck.svg',
        keywords: [
          'lua'
        ]
      },
      {
        title: 'Hackage',
        previewBadgeUri: '/hackage/v/lens.svg',
        exampleBadgeUri: 'https://img.shields.io/hackage/v/lens.svg'
      },
      {
        title: 'Crates.io',
        previewBadgeUri: '/crates/v/rustc-serialize.svg',
        exampleBadgeUri: 'https://img.shields.io/crates/v/rustc-serialize.svg',
        keywords: [
          'Rust'
        ]
      },
      {
        title: 'Packagist',
        previewBadgeUri: '/packagist/v/symfony/symfony.svg',
        exampleBadgeUri: 'https://img.shields.io/packagist/v/symfony/symfony.svg',
        keywords: [
          'PHP'
        ]
      },
      {
        title: 'Packagist Pre Release',
        previewBadgeUri: '/packagist/vpre/symfony/symfony.svg',
        exampleBadgeUri: 'https://img.shields.io/packagist/vpre/symfony/symfony.svg',
        keywords: [
          'PHP'
        ]
      },
      {
        title: 'Bintray',
        previewBadgeUri: '/bintray/v/asciidoctor/maven/asciidoctorj.svg',
        exampleBadgeUri: 'https://img.shields.io/bintray/v/asciidoctor/maven/asciidoctorj.svg'
      },
      {
        title: 'Clojars',
        previewBadgeUri: '/clojars/v/prismic.svg',
        exampleBadgeUri: 'https://img.shields.io/clojars/v/prismic.svg'
      },
      {
        title: 'CocoaPods',
        previewBadgeUri: '/cocoapods/v/AFNetworking.svg',
        exampleBadgeUri: 'https://img.shields.io/cocoapods/v/AFNetworking.svg'
      },
      {
        title: 'Bower',
        previewBadgeUri: '/bower/v/bootstrap.svg',
        exampleBadgeUri: 'https://img.shields.io/bower/v/bootstrap.svg'
      },
      {
        title: 'Bower Pre Release',
        previewBadgeUri: '/bower/vpre/bootstrap.svg',
        exampleBadgeUri: 'https://img.shields.io/bower/vpre/bootstrap.svg'
      },
      {
        title: 'Pub',
        previewBadgeUri: '/pub/v/box2d.svg',
        exampleBadgeUri: 'https://img.shields.io/pub/v/box2d.svg'
      },
      {
        title: 'Hex.pm',
        previewBadgeUri: '/hexpm/v/plug.svg',
        exampleBadgeUri: 'https://img.shields.io/hexpm/v/plug.svg'
      },
      {
        title: 'GitHub tag',
        previewBadgeUri: '/github/tag/expressjs/express.svg',
        exampleBadgeUri: 'https://img.shields.io/github/tag/expressjs/express.svg',
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub package version',
        previewBadgeUri: '/github/package-json/v/badges/shields.svg',
        exampleBadgeUri: 'https://img.shields.io/github/package-json/v/badges/shields.svg',
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub manifest version',
        previewBadgeUri: '/github/manifest-json/v/RedSparr0w/IndieGala-Helper.svg',
        exampleBadgeUri: 'https://img.shields.io/github/manifest-json/v/RedSparr0w/IndieGala-Helper.svg',
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub release',
        previewBadgeUri: '/github/release/qubyte/rubidium.svg',
        exampleBadgeUri: 'https://img.shields.io/github/release/qubyte/rubidium.svg',
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub (pre-)release',
        previewBadgeUri: '/github/release/qubyte/rubidium/all.svg',
        exampleBadgeUri: 'https://img.shields.io/github/release/qubyte/rubidium/all.svg',
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub commits',
        previewBadgeUri: '/github/commits-since/SubtitleEdit/subtitleedit/3.4.7.svg',
        exampleBadgeUri: 'https://img.shields.io/github/commits-since/SubtitleEdit/subtitleedit/3.4.7.svg',
        keywords: [
          'GitHub',
          'commit'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'Github commits (since latest release)',
        previewBadgeUri: '/github/commits-since/SubtitleEdit/subtitleedit/latest.svg',
        exampleBadgeUri: 'https://img.shields.io/github/commits-since/SubtitleEdit/subtitleedit/latest.svg',
        keywords: [
          'GitHub',
          'commit'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'Chef cookbook',
        previewBadgeUri: '/cookbook/v/chef-sugar.svg',
        exampleBadgeUri: 'https://img.shields.io/cookbook/v/chef-sugar.svg'
      },
      {
        title: 'NuGet',
        previewBadgeUri: '/nuget/v/Nuget.Core.svg',
        exampleBadgeUri: 'https://img.shields.io/nuget/v/Nuget.Core.svg'
      },
      {
        title: 'NuGet Pre Release',
        previewBadgeUri: '/nuget/vpre/Microsoft.AspNet.Mvc.svg',
        exampleBadgeUri: 'https://img.shields.io/nuget/vpre/Microsoft.AspNet.Mvc.svg'
      },
      {
        title: 'MyGet',
        previewBadgeUri: '/myget/mongodb/v/MongoDB.Driver.Core.svg',
        exampleBadgeUri: 'https://img.shields.io/myget/mongodb/v/MongoDB.Driver.Core.svg'
      },
      {
        title: 'MyGet Pre Release',
        previewBadgeUri: '/myget/yolodev/vpre/YoloDev.Dnx.FSharp.svg',
        exampleBadgeUri: 'https://img.shields.io/myget/yolodev/vpre/YoloDev.Dnx.FSharp.svg'
      },
      {
        title: 'MyGet tenant',
        previewBadgeUri: '/dotnet.myget/dotnet-coreclr/v/Microsoft.DotNet.CoreCLR.svg',
        exampleBadgeUri: 'https://img.shields.io/dotnet.myget/dotnet-coreclr/v/Microsoft.DotNet.CoreCLR.svg'
      },
      {
        title: 'Chocolatey',
        previewBadgeUri: '/chocolatey/v/git.svg',
        exampleBadgeUri: 'https://img.shields.io/chocolatey/v/git.svg'
      },
      {
        title: 'PowerShell Gallery',
        previewBadgeUri: '/powershellgallery/v/Zyborg.Vault.svg',
        exampleBadgeUri: 'https://img.shields.io/powershellgallery/v/Zyborg.Vault.svg'
      },
      {
        title: 'Puppet Forge',
        previewBadgeUri: '/puppetforge/v/vStone/percona.svg',
        exampleBadgeUri: 'https://img.shields.io/puppetforge/v/vStone/percona.svg'
      },
      {
        title: 'Maven Central',
        previewBadgeUri: '/maven-central/v/org.apache.maven/apache-maven.svg',
        exampleBadgeUri: 'https://img.shields.io/maven-central/v/org.apache.maven/apache-maven.svg'
      },
      {
        title: 'Maven Central with version prefix filter',
        previewBadgeUri: '/maven-central/v/org.apache.maven/apache-maven/2.svg',
        exampleBadgeUri: 'https://img.shields.io/maven-central/v/org.apache.maven/apache-maven/2.svg'
      },
      {
        title: 'Sonatype Nexus (Releases)',
        previewBadgeUri: '/nexus/r/https/oss.sonatype.org/com.google.guava/guava.svg',
        exampleBadgeUri: 'https://img.shields.io/nexus/r/https/oss.sonatype.org/com.google.guava/guava.svg'
      },
      {
        title: 'Sonatype Nexus (Snapshots)',
        previewBadgeUri: '/nexus/s/https/oss.sonatype.org/com.google.guava/guava.svg',
        exampleBadgeUri: 'https://img.shields.io/nexus/s/https/oss.sonatype.org/com.google.guava/guava.svg'
      },
      {
        title: 'WordPress plugin',
        previewBadgeUri: '/wordpress/plugin/v/akismet.svg',
        exampleBadgeUri: 'https://img.shields.io/wordpress/plugin/v/akismet.svg'
      },
      {
        title: 'WordPress',
        previewBadgeUri: '/wordpress/v/akismet.svg',
        exampleBadgeUri: 'https://img.shields.io/wordpress/v/akismet.svg'
      },
      {
        title: 'apm',
        previewBadgeUri: '/apm/v/vim-mode.svg',
        exampleBadgeUri: 'https://img.shields.io/apm/v/vim-mode.svg',
        keywords: [
          'atom'
        ]
      },
      {
        title: 'CPAN',
        previewBadgeUri: '/cpan/v/Config-Augeas.svg',
        exampleBadgeUri: 'https://img.shields.io/cpan/v/Config-Augeas.svg',
        keywords: [
          'perl'
        ]
      },
      {
        title: 'CRAN',
        previewBadgeUri: '/cran/v/devtools.svg',
        exampleBadgeUri: 'https://img.shields.io/cran/v/devtools.svg',
        keywords: [
          'R'
        ]
      },
      {
        title: 'CRAN',
        previewBadgeUri: '/cran/l/devtools.svg',
        exampleBadgeUri: 'https://img.shields.io/cran/l/devtools.svg',
        keywords: [
          'R'
        ]
      },
      {
        title: 'CTAN',
        previewBadgeUri: '/ctan/v/tex.svg',
        exampleBadgeUri: 'https://img.shields.io/ctan/v/tex.svg',
        keywords: [
          'tex'
        ]
      },
      {
        title: 'DUB',
        previewBadgeUri: '/dub/v/vibe-d.svg',
        exampleBadgeUri: 'https://img.shields.io/dub/v/vibe-d.svg',
        keywords: [
          'dub'
        ]
      },
      {
        title: 'AUR',
        previewBadgeUri: '/aur/version/yaourt.svg',
        exampleBadgeUri: 'https://img.shields.io/aur/version/yaourt.svg',
        keywords: [
          'aur'
        ]
      },
      {
        title: 'Chrome Web Store',
        previewBadgeUri: '/chrome-web-store/v/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        exampleBadgeUri: 'https://img.shields.io/chrome-web-store/v/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        keywords: [
          'chrome'
        ]
      },
      {
        title: 'homebrew',
        previewBadgeUri: '/homebrew/v/cake.svg',
        exampleBadgeUri: 'https://img.shields.io/homebrew/v/cake.svg'
      },
      {
        title: 'Mozilla Add-on',
        previewBadgeUri: '/amo/v/dustman.svg',
        exampleBadgeUri: 'https://img.shields.io/amo/v/dustman.svg',
        keywords: [
          'amo',
          'firefox'
        ]
      },
      {
        title: 'Visual Studio Marketplace',
        previewBadgeUri: '/vscode-marketplace/v/ritwickdey.LiveServer.svg',
        exampleBadgeUri: 'https://img.shields.io/vscode-marketplace/v/ritwickdey.LiveServer.svg',
        keywords: [
          'vscode-marketplace'
        ]
      },
      {
        title: 'Itunes App Store',
        previewBadgeUri: '/itunes/v/803453959.svg',
        exampleBadgeUri: 'https://img.shields.io/itunes/v/BUNDLE_ID.svg'
      },
      {
        title: 'JitPack',
        previewBadgeUri: '/jitpack/v/jitpack/maven-simple.svg',
        exampleBadgeUri: 'https://img.shields.io/jitpack/v/jitpack/maven-simple.svg',
        keywords: [
          'jitpack',
          'java',
          'maven'
        ]
      }
    ]
  },
  {
    sectionId: 'social',
    sectionName: 'Social',
    badges: [
      {
        title: 'GitHub forks',
        previewBadgeUri: '/github/forks/badges/shields.svg?style=social&label=Fork',
        exampleBadgeUri: 'https://img.shields.io/github/forks/badges/shields.svg?style=social&label=Fork',
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub stars',
        previewBadgeUri: '/github/stars/badges/shields.svg?style=social&label=Stars',
        exampleBadgeUri: 'https://img.shields.io/github/stars/badges/shields.svg?style=social&label=Stars',
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub watchers',
        previewBadgeUri: '/github/watchers/badges/shields.svg?style=social&label=Watch',
        exampleBadgeUri: 'https://img.shields.io/github/watchers/badges/shields.svg?style=social&label=Watch',
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub followers',
        previewBadgeUri: '/github/followers/espadrine.svg?style=social&label=Follow',
        exampleBadgeUri: 'https://img.shields.io/github/followers/espadrine.svg?style=social&label=Follow',
        documentation: 'githubDoc'
      },
      {
        title: 'Twitter URL',
        previewBadgeUri: '/twitter/url/http/shields.io.svg?style=social',
        exampleBadgeUri: 'https://img.shields.io/twitter/url/http/shields.io.svg?style=social'
      },
      {
        title: 'Twitter Follow',
        previewBadgeUri: '/twitter/follow/espadrine.svg?style=social&label=Follow',
        exampleBadgeUri: 'https://img.shields.io/twitter/follow/espadrine.svg?style=social&label=Follow'
      }
    ]
  },
  {
    sectionId: 'miscellaneous',
    sectionName: 'Miscellaneous',
    badges: [
      {
        title: 'Gratipay',
        previewBadgeUri: '/gratipay/project/shields.svg',
        exampleBadgeUri: 'https://img.shields.io/gratipay/project/shields.svg'
      },
      {
        title: 'Bountysource',
        previewBadgeUri: '/bountysource/team/mozilla-core/activity.svg',
        exampleBadgeUri: 'https://img.shields.io/bountysource/team/mozilla-core/activity.svg'
      },
      {
        title: 'Beerpay',
        previewBadgeUri: '/beerpay/hashdog/scrapfy-chrome-extension.svg',
        exampleBadgeUri: 'https://img.shields.io/beerpay/hashdog/scrapfy-chrome-extension.svg'
      },
      {
        title: 'Code Climate',
        previewBadgeUri: '/codeclimate/github/kabisaict/flow.svg',
        exampleBadgeUri: 'https://img.shields.io/codeclimate/github/kabisaict/flow.svg'
      },
      {
        title: 'Code Climate',
        previewBadgeUri: '/codeclimate/coverage/github/triAGENS/ashikawa-core.svg',
        exampleBadgeUri: 'https://img.shields.io/codeclimate/coverage/github/triAGENS/ashikawa-core.svg'
      },
      {
        title: 'Code Climate',
        previewBadgeUri: '/codeclimate/issues/github/me-and/mdf.svg',
        exampleBadgeUri: 'https://img.shields.io/codeclimate/issues/github/me-and/mdf.svg'
      },
      {
        title: 'Codetally',
        previewBadgeUri: '/codetally/triggerman722/colorstrap.svg',
        exampleBadgeUri: 'https://img.shields.io/codetally/triggerman722/colorstrap.svg'
      },
      {
        title: 'bitHound',
        previewBadgeUri: '/bithound/code/github/rexxars/sse-channel.svg',
        exampleBadgeUri: 'https://img.shields.io/bithound/code/github/rexxars/sse-channel.svg'
      },
      {
        title: 'Gemnasium',
        previewBadgeUri: '/gemnasium/mathiasbynens/he.svg',
        exampleBadgeUri: 'https://img.shields.io/gemnasium/mathiasbynens/he.svg'
      },
      {
        title: 'Hackage-Deps',
        previewBadgeUri: '/hackage-deps/v/lens.svg',
        exampleBadgeUri: 'https://img.shields.io/hackage-deps/v/lens.svg'
      },
      {
        title: 'Crates.io',
        previewBadgeUri: '/crates/l/rustc-serialize.svg',
        exampleBadgeUri: 'https://img.shields.io/crates/l/rustc-serialize.svg',
        keywords: [
          'Rust'
        ]
      },
      {
        title: 'Requires.io',
        previewBadgeUri: '/requires/github/celery/celery.svg',
        exampleBadgeUri: 'https://img.shields.io/requires/github/celery/celery.svg'
      },
      {
        title: 'VersionEye',
        previewBadgeUri: '/versioneye/d/ruby/rails.svg',
        exampleBadgeUri: 'https://img.shields.io/versioneye/d/ruby/rails.svg'
      },
      {
        title: 'Packagist',
        previewBadgeUri: '/packagist/l/doctrine/orm.svg',
        exampleBadgeUri: 'https://img.shields.io/packagist/l/doctrine/orm.svg',
        keywords: [
          'PHP'
        ]
      },
      {
        title: 'npm',
        previewBadgeUri: '/npm/l/express.svg',
        exampleBadgeUri: 'https://img.shields.io/npm/l/express.svg',
        keywords: [
          'node'
        ]
      },
      {
        title: 'apm',
        previewBadgeUri: '/apm/l/vim-mode.svg',
        exampleBadgeUri: 'https://img.shields.io/apm/l/vim-mode.svg',
        keywords: [
          'atom'
        ]
      },
      {
        title: 'Bower',
        previewBadgeUri: '/bower/l/bootstrap.svg',
        exampleBadgeUri: 'https://img.shields.io/bower/l/bootstrap.svg'
      },
      {
        title: 'PyPI',
        previewBadgeUri: '/pypi/l/Django.svg',
        exampleBadgeUri: 'https://img.shields.io/pypi/l/Django.svg',
        keywords: [
          'python'
        ]
      },
      {
        title: 'PyPI',
        previewBadgeUri: '/pypi/wheel/Django.svg',
        exampleBadgeUri: 'https://img.shields.io/pypi/wheel/Django.svg',
        keywords: [
          'python'
        ]
      },
      {
        title: 'PyPI',
        previewBadgeUri: '/pypi/format/Django.svg',
        exampleBadgeUri: 'https://img.shields.io/pypi/format/Django.svg',
        keywords: [
          'python'
        ]
      },
      {
        title: 'PyPI',
        previewBadgeUri: '/pypi/pyversions/Django.svg',
        exampleBadgeUri: 'https://img.shields.io/pypi/pyversions/Django.svg',
        keywords: [
          'python'
        ]
      },
      {
        title: 'PyPI',
        previewBadgeUri: '/pypi/implementation/Django.svg',
        exampleBadgeUri: 'https://img.shields.io/pypi/implementation/Django.svg',
        keywords: [
          'python'
        ]
      },
      {
        title: 'PyPI',
        previewBadgeUri: '/pypi/status/Django.svg',
        exampleBadgeUri: 'https://img.shields.io/pypi/status/Django.svg',
        keywords: [
          'python'
        ]
      },
      {
        title: 'Hex.pm',
        previewBadgeUri: '/hexpm/l/plug.svg',
        exampleBadgeUri: 'https://img.shields.io/hexpm/l/plug.svg'
      },
      {
        title: 'CocoaPods',
        previewBadgeUri: '/cocoapods/l/AFNetworking.svg',
        exampleBadgeUri: 'https://img.shields.io/cocoapods/l/AFNetworking.svg'
      },
      {
        title: 'CPAN',
        previewBadgeUri: '/cpan/l/Config-Augeas.svg',
        exampleBadgeUri: 'https://img.shields.io/cpan/l/Config-Augeas.svg',
        keywords: [
          'perl'
        ]
      },
      {
        title: 'CTAN',
        previewBadgeUri: '/ctan/l/novel.svg',
        exampleBadgeUri: 'https://img.shields.io/ctan/l/novel.svg',
        keywords: [
          'tex'
        ]
      },
      {
        title: 'Wheelmap',
        previewBadgeUri: '/wheelmap/a/2323004600.svg',
        exampleBadgeUri: 'https://img.shields.io/wheelmap/a/2323004600.svg'
      },
      {
        title: 'GitHub issues',
        previewBadgeUri: '/github/issues/badges/shields.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues/badges/shields.svg',
        keywords: [
          'GitHub',
          'issue'
        ],
        documentation: 'githubDoc'
      },
      {
        title: '',
        previewBadgeUri: '/github/issues-raw/badges/shields.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues-raw/badges/shields.svg',
        keywords: [
          'GitHub',
          'issue'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub pull requests',
        previewBadgeUri: '/github/issues-pr/cdnjs/cdnjs.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues-pr/cdnjs/cdnjs.svg',
        keywords: [
          'GitHub',
          'pullrequest',
          'pr'
        ],
        documentation: 'githubDoc'
      },
      {
        title: '',
        previewBadgeUri: '/github/issues-pr-raw/cdnjs/cdnjs.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues-pr-raw/cdnjs/cdnjs.svg',
        keywords: [
          'GitHub',
          'pullrequest',
          'pr'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub closed issues',
        previewBadgeUri: '/github/issues-closed/badges/shields.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues-closed/badges/shields.svg',
        keywords: [
          'GitHub',
          'issue'
        ],
        documentation: 'githubDoc'
      },
      {
        title: '',
        previewBadgeUri: '/github/issues-closed-raw/badges/shields.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues-closed-raw/badges/shields.svg',
        keywords: [
          'GitHub',
          'issue'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub closed pull requests',
        previewBadgeUri: '/github/issues-pr-closed/cdnjs/cdnjs.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues-pr-closed/cdnjs/cdnjs.svg',
        keywords: [
          'GitHub',
          'pullrequest',
          'pr'
        ],
        documentation: 'githubDoc'
      },
      {
        title: '',
        previewBadgeUri: '/github/issues-pr-closed-raw/cdnjs/cdnjs.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues-pr-closed/cdnjs/cdnjs.svg',
        keywords: [
          'GitHub',
          'pullrequest',
          'pr'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub issues by-label',
        previewBadgeUri: '/github/issues/badges/shields/service-badge.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues/badges/shields/service-badge.svg',
        keywords: [
          'GitHub',
          'issue',
          'label'
        ],
        documentation: 'githubDoc'
      },
      {
        title: '',
        previewBadgeUri: '/github/issues-raw/badges/shields/service-badge.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues-raw/badges/shields/service-badge.svg',
        keywords: [
          'GitHub',
          'issue',
          'label'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub pull requests by-label',
        previewBadgeUri: '/github/issues-pr/badges/shields/service-badge.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues-pr/badges/shields/service-badge.svg',
        keywords: [
          'GitHub',
          'pullrequests',
          'label'
        ],
        documentation: 'githubDoc'
      },
      {
        title: '',
        previewBadgeUri: '/github/issues-pr-raw/badges/shields/service-badge.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues-pr-raw/badges/shields/service-badge.svg',
        keywords: [
          'GitHub',
          'pullrequests',
          'label'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub issue state',
        previewBadgeUri: '/github/issues/detail/s/badges/shields/979.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues/detail/badges/shields/979.svg',
        keywords: [
          'GitHub',
          'issue',
          'pullrequest',
          'detail'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub issue title',
        previewBadgeUri: '/github/issues/detail/s/badges/shields/979.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues/detail/s/badges/shields/979.svg',
        keywords: [
          'GitHub',
          'issue',
          'pullrequest',
          'detail'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub issue author',
        previewBadgeUri: '/github/issues/detail/u/badges/shields/979.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues/detail/u/badges/shields/979.svg',
        keywords: [
          'GitHub',
          'issue',
          'pullrequest',
          'detail'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub issue label',
        previewBadgeUri: '/github/issues/detail/label/badges/shields/979.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues/detail/label/badges/shields/979.svg',
        keywords: [
          'GitHub',
          'issue',
          'pullrqeuest',
          'detail'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub issue comments',
        previewBadgeUri: '/github/issues/detail/comments/badges/shields/979.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues/detail/comments/badges/shields/979.svg',
        keywords: [
          'GitHub',
          'issue',
          'pullrequest',
          'detail'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub issue age',
        previewBadgeUri: '/github/issues/detail/age/badges/shields/979.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues/detail/age/badges/shields/979.svg',
        keywords: [
          'GitHub',
          'issue',
          'pullrequest',
          'detail'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub issue last update',
        previewBadgeUri: '/github/issues/detail/last-update/badges/shields/979.svg',
        exampleBadgeUri: 'https://img.shields.io/github/issues/detail/last-update/badges/shields/979.svg',
        keywords: [
          'GitHub',
          'issue',
          'pullrequest',
          'detail'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub Release Date',
        previewBadgeUri: '/github/release-date/SubtitleEdit/subtitleedit.svg',
        exampleBadgeUri: 'https://img.shields.io/github/release-date/SubtitleEdit/subtitleedit.svg',
        keywords: [
          'GitHub',
          'release',
          'date'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub (Pre-)Release Date',
        previewBadgeUri: '/github/release-date-pre/Cockatrice/Cockatrice.svg',
        exampleBadgeUri: 'https://img.shields.io/github/release-date-pre/Cockatrice/Cockatrice.svg',
        keywords: [
          'GitHub',
          'release',
          'date'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub pull request check state',
        previewBadgeUri: '/github/status/s/pulls/badges/shields/1110.svg',
        exampleBadgeUri: 'https://img.shields.io/github/status/s/pulls/badges/shields/1110.svg',
        keywords: [
          'GitHub',
          'pullrequest',
          'detail',
          'check'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub pull request check contexts',
        previewBadgeUri: '/github/status/contexts/pulls/badges/shields/1110.svg',
        exampleBadgeUri: 'https://img.shields.io/github/status/contexts/pulls/badges/shields/1110.svg',
        keywords: [
          'GitHub',
          'pullrequest',
          'detail',
          'check'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub contributors',
        previewBadgeUri: '/github/contributors/cdnjs/cdnjs.svg',
        exampleBadgeUri: 'https://img.shields.io/github/contributors/cdnjs/cdnjs.svg',
        keywords: [
          'GitHub',
          'contributor'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'license',
        previewBadgeUri: '/github/license/mashape/apistatus.svg',
        exampleBadgeUri: 'https://img.shields.io/github/license/mashape/apistatus.svg',
        keywords: [
          'GitHub',
          'license'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'Github file size',
        previewBadgeUri: '/github/size/webcaetano/craft/build/phaser-craft.min.js.svg',
        exampleBadgeUri: 'https://img.shields.io/github/size/webcaetano/craft/build/phaser-craft.min.js.svg',
        keywords: [
          'GitHub',
          'file',
          'size'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'Github search hit counter',
        previewBadgeUri: '/github/search/torvalds/linux/goto.svg',
        exampleBadgeUri: 'https://img.shields.io/github/search/torvalds/linux/goto.svg',
        keywords: [
          'GitHub',
          'search',
          'hit',
          'counter'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub commit activity the past week, 4 weeks, year',
        previewBadgeUri: '/github/commit-activity/y/eslint/eslint.svg',
        exampleBadgeUri: 'https://img.shields.io/github/commit-activity/y/eslint/eslint.svg',
        keywords: [
          'GitHub',
          'commit',
          'commits',
          'activity'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub last commit',
        previewBadgeUri: '/github/last-commit/google/skia.svg',
        exampleBadgeUri: 'https://img.shields.io/github/commits/google/skia/last.svg',
        keywords: [
          'GitHub',
          'last',
          'latest',
          'commit'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'GitHub last commit (branch)',
        previewBadgeUri: '/github/last-commit/google/skia/infra/config.svg',
        exampleBadgeUri: 'https://img.shields.io/github/commits/google/skia/infra/config/last.svg',
        keywords: [
          'GitHub',
          'last',
          'latest',
          'commit'
        ],
        documentation: 'githubDoc'
      },
      {
        title: 'Bitbucket issues',
        previewBadgeUri: '/bitbucket/issues/atlassian/python-bitbucket.svg',
        exampleBadgeUri: 'https://img.shields.io/bitbucket/issues/atlassian/python-bitbucket.svg'
      },
      {
        title: '',
        previewBadgeUri: '/bitbucket/issues-raw/atlassian/python-bitbucket.svg',
        exampleBadgeUri: 'https://img.shields.io/bitbucket/issues-raw/atlassian/python-bitbucket.svg',
        keywords: [
          'Bitbucket'
        ]
      },
      {
        title: 'Bitbucket open pull requests',
        previewBadgeUri: '/bitbucket/pr/osrf/gazebo.svg',
        exampleBadgeUri: 'https://img.shields.io/bitbucket/pr/osrf/gazebo.svg'
      },
      {
        title: '',
        previewBadgeUri: '/bitbucket/pr-raw/osrf/gazebo.svg',
        exampleBadgeUri: 'https://img.shields.io/bitbucket/pr-raw/osrf/gazebo.svg',
        keywords: [
          'Bitbucket'
        ]
      },
      {
        title: 'WordPress plugin rating',
        previewBadgeUri: '/wordpress/plugin/r/akismet.svg',
        exampleBadgeUri: 'https://img.shields.io/wordpress/plugin/r/akismet.svg'
      },
      {
        title: 'WordPress theme rating',
        previewBadgeUri: '/wordpress/theme/r/hestia.svg',
        exampleBadgeUri: 'https://img.shields.io/wordpress/theme/r/hestia.svg'
      },
      {
        title: 'Codacy grade',
        previewBadgeUri: '/codacy/grade/e27821fb6289410b8f58338c7e0bc686.svg',
        exampleBadgeUri: 'https://img.shields.io/codacy/grade/e27821fb6289410b8f58338c7e0bc686.svg'
      },
      {
        title: 'Codacy branch grade',
        previewBadgeUri: '/codacy/grade/e27821fb6289410b8f58338c7e0bc686/master.svg',
        exampleBadgeUri: 'https://img.shields.io/codacy/grade/e27821fb6289410b8f58338c7e0bc686/master.svg'
      },
      {
        title: 'Codacy coverage',
        previewBadgeUri: '/codacy/coverage/c44df2d9c89a4809896914fd1a40bedd.svg',
        exampleBadgeUri: 'https://img.shields.io/codacy/coverage/c44df2d9c89a4809896914fd1a40bedd.svg'
      },
      {
        title: 'Codacy branch coverage',
        previewBadgeUri: '/codacy/coverage/c44df2d9c89a4809896914fd1a40bedd/master.svg',
        exampleBadgeUri: 'https://img.shields.io/codacy/coverage/c44df2d9c89a4809896914fd1a40bedd/master.svg'
      },
      {
        title: 'Cauditor',
        previewBadgeUri: '/cauditor/mi/matthiasmullie/scrapbook/master.svg',
        exampleBadgeUri: 'https://img.shields.io/cauditor/mi/matthiasmullie/scrapbook/master.svg'
      },
      {
        title: 'Libscore',
        previewBadgeUri: '/libscore/s/jQuery.svg',
        exampleBadgeUri: 'https://img.shields.io/libscore/s/jQuery.svg'
      },
      {
        title: 'Puppet Forge',
        previewBadgeUri: '/puppetforge/e/camptocamp/openssl.svg',
        exampleBadgeUri: 'https://img.shields.io/puppetforge/e/camptocamp/openssl.svg'
      },
      {
        title: 'Puppet Forge',
        previewBadgeUri: '/puppetforge/f/camptocamp/openssl.svg',
        exampleBadgeUri: 'https://img.shields.io/puppetforge/f/camptocamp/openssl.svg'
      },
      {
        title: 'Puppet Forge',
        previewBadgeUri: '/puppetforge/rc/camptocamp.svg',
        exampleBadgeUri: 'https://img.shields.io/puppetforge/rc/camptocamp.svg'
      },
      {
        title: 'Puppet Forge',
        previewBadgeUri: '/puppetforge/mc/camptocamp.svg',
        exampleBadgeUri: 'https://img.shields.io/puppetforge/mc/camptocamp.svg'
      },
      {
        title: 'Gems',
        previewBadgeUri: '/gem/u/raphink.svg',
        exampleBadgeUri: 'https://img.shields.io/gem/u/raphink.svg',
        keywords: [
          'ruby'
        ]
      },
      {
        title: 'Gems',
        previewBadgeUri: '/gem/rt/puppet.svg',
        exampleBadgeUri: 'https://img.shields.io/gem/rt/puppet.svg',
        keywords: [
          'ruby'
        ]
      },
      {
        title: 'Gems',
        previewBadgeUri: '/gem/rd/facter.svg',
        exampleBadgeUri: 'https://img.shields.io/gem/rd/facter.svg',
        keywords: [
          'ruby'
        ]
      },
      {
        title: 'DUB',
        previewBadgeUri: '/dub/l/vibe-d.svg',
        exampleBadgeUri: 'https://img.shields.io/dub/l/vibe-d.svg',
        keywords: [
          'dub'
        ]
      },
      {
        title: 'Docker Stars',
        previewBadgeUri: '/docker/stars/_/ubuntu.svg',
        exampleBadgeUri: 'https://img.shields.io/docker/stars/_/ubuntu.svg',
        keywords: [
          'docker',
          'stars'
        ]
      },
      {
        title: 'Docker Pulls',
        previewBadgeUri: '/docker/pulls/mashape/kong.svg',
        exampleBadgeUri: 'https://img.shields.io/docker/pulls/mashape/kong.svg',
        keywords: [
          'docker',
          'pulls'
        ]
      },
      {
        title: 'Docker Automated build',
        previewBadgeUri: '/docker/automated/jrottenberg/ffmpeg.svg',
        exampleBadgeUri: 'https://img.shields.io/docker/automated/jrottenberg/ffmpeg.svg',
        keywords: [
          'docker',
          'automated',
          'build'
        ]
      },
      {
        title: 'Docker Build Status',
        previewBadgeUri: '/docker/build/jrottenberg/ffmpeg.svg',
        exampleBadgeUri: 'https://img.shields.io/docker/build/jrottenberg/ffmpeg.svg',
        keywords: [
          'docker',
          'build',
          'status'
        ]
      },
      {
        title: 'ImageLayers Size',
        previewBadgeUri: '/imagelayers/image-size/_/ubuntu/latest.svg',
        exampleBadgeUri: 'https://img.shields.io/imagelayers/image-size/_/ubuntu/latest.svg',
        keywords: [
          'imagelayers'
        ]
      },
      {
        title: 'ImageLayers Layers',
        previewBadgeUri: '/imagelayers/layers/_/ubuntu/latest.svg',
        exampleBadgeUri: 'https://img.shields.io/imagelayers/layers/_/ubuntu/latest.svg',
        keywords: [
          'imagelayers'
        ]
      },
      {
        title: 'Gitter',
        previewBadgeUri: '/gitter/room/nwjs/nw.js.svg',
        exampleBadgeUri: 'https://img.shields.io/gitter/room/nwjs/nw.js.svg'
      },
      {
        title: 'JIRA issue',
        previewBadgeUri: '/jira/issue/https/issues.apache.org/jira/KAFKA-2896.svg',
        exampleBadgeUri: 'https://img.shields.io/jira/issue/https/issues.apache.org/jira/KAFKA-2896.svg'
      },
      {
        title: 'JIRA sprint completion',
        previewBadgeUri: '/jira/sprint/https/jira.spring.io/94.svg',
        exampleBadgeUri: 'https://img.shields.io/jira/sprint/https/jira.spring.io/94.svg',
        documentation: 'jira-sprint-completion'
      },
      {
        title: 'Maintenance',
        previewBadgeUri: '/maintenance/yes/2017.svg',
        exampleBadgeUri: 'https://img.shields.io/maintenance/yes/2017.svg'
      },
      {
        title: 'AUR',
        previewBadgeUri: '/aur/license/yaourt.svg',
        exampleBadgeUri: 'https://img.shields.io/aur/license/yaourt.svg',
        keywords: [
          'aur'
        ]
      },
      {
        title: 'Waffle.io',
        previewBadgeUri: '/waffle/label/evancohen/smart-mirror/in%20progress.svg',
        exampleBadgeUri: 'https://img.shields.io/waffle/label/evancohen/smart-mirror/in%20progress.svg'
      },
      {
        title: 'Chrome Web Store',
        previewBadgeUri: '/chrome-web-store/users/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        exampleBadgeUri: 'https://img.shields.io/chrome-web-store/users/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        keywords: [
          'chrome'
        ]
      },
      {
        title: 'Chrome Web Store',
        previewBadgeUri: '/chrome-web-store/price/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        exampleBadgeUri: 'https://img.shields.io/chrome-web-store/price/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        keywords: [
          'chrome'
        ]
      },
      {
        title: 'Chrome Web Store',
        previewBadgeUri: '/chrome-web-store/rating/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        exampleBadgeUri: 'https://img.shields.io/chrome-web-store/rating/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        keywords: [
          'chrome'
        ]
      },
      {
        title: 'Chrome Web Store',
        previewBadgeUri: '/chrome-web-store/stars/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        exampleBadgeUri: 'https://img.shields.io/chrome-web-store/stars/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        keywords: [
          'chrome'
        ]
      },
      {
        title: 'Chrome Web Store',
        previewBadgeUri: '/chrome-web-store/rating-count/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        exampleBadgeUri: 'https://img.shields.io/chrome-web-store/rating-count/nimelepbpejjlbmoobocpfnjhihnpked.svg',
        keywords: [
          'chrome'
        ]
      },
      {
        title: 'AUR',
        previewBadgeUri: '/aur/votes/yaourt.svg',
        exampleBadgeUri: 'https://img.shields.io/aur/votes/yaourt.svg',
        keywords: [
          'aur'
        ]
      },
      {
        title: 'Mozilla Add-on',
        previewBadgeUri: '/amo/users/dustman.svg',
        exampleBadgeUri: 'https://img.shields.io/amo/users/dustman.svg',
        keywords: [
          'amo',
          'firefox'
        ]
      },
      {
        title: 'Mozilla Add-on',
        previewBadgeUri: '/amo/rating/dustman.svg',
        exampleBadgeUri: 'https://img.shields.io/amo/rating/dustman.svg',
        keywords: [
          'amo',
          'firefox'
        ]
      },
      {
        title: 'Mozilla Add-on',
        previewBadgeUri: '/amo/stars/dustman.svg',
        exampleBadgeUri: 'https://img.shields.io/amo/stars/dustman.svg',
        keywords: [
          'amo',
          'firefox'
        ]
      },
      {
        title: 'Swagger Validator',
        previewBadgeUri: '/swagger/valid/2.0/https/bitbucket.org/api/swagger.json.svg',
        exampleBadgeUri: 'https://img.shields.io/swagger/valid/2.0/https/bitbucket.org/api/swagger.json.svg'
      },
      {
        title: 'Uptime Robot status',
        previewBadgeUri: '/uptimerobot/status/m778918918-3e92c097147760ee39d02d36.svg',
        exampleBadgeUri: 'https://img.shields.io/uptimerobot/status/m778918918-3e92c097147760ee39d02d36.svg'
      },
      {
        title: 'Uptime Robot ratio',
        previewBadgeUri: '/uptimerobot/ratio/m778918918-3e92c097147760ee39d02d36.svg',
        exampleBadgeUri: 'https://img.shields.io/uptimerobot/ratio/m778918918-3e92c097147760ee39d02d36.svg'
      },
      {
        title: 'Uptime Robot ratio (7 days)',
        previewBadgeUri: '/uptimerobot/ratio/7/m778918918-3e92c097147760ee39d02d36.svg',
        exampleBadgeUri: 'https://img.shields.io/uptimerobot/ratio/7/m778918918-3e92c097147760ee39d02d36.svg'
      },
      {
        title: 'Discord',
        previewBadgeUri: '/discord/102860784329052160.svg',
        exampleBadgeUri: 'https://img.shields.io/discord/102860784329052160.svg'
      },
      {
        title: 'Visual Studio Marketplace',
        previewBadgeUri: '/vscode-marketplace/r/ritwickdey.LiveServer.svg',
        exampleBadgeUri: 'https://img.shields.io/vscode-marketplace/r/ritwickdey.LiveServer.svg',
        keywords: [
          'vscode-marketplace'
        ]
      }
    ]
  },
  {
    sectionId: 'miscellaneous',
    sectionName: 'Longer Miscellaneous',
    badges: [
      {
        title: 'David',
        previewBadgeUri: '/david/expressjs/express.svg',
        exampleBadgeUri: 'https://img.shields.io/david/expressjs/express.svg'
      },
      {
        title: 'David',
        previewBadgeUri: '/david/dev/expressjs/express.svg',
        exampleBadgeUri: 'https://img.shields.io/david/dev/expressjs/express.svg'
      },
      {
        title: 'David',
        previewBadgeUri: '/david/optional/elnounch/byebye.svg',
        exampleBadgeUri: 'https://img.shields.io/david/optional/elnounch/byebye.svg'
      },
      {
        title: 'David',
        previewBadgeUri: '/david/peer/webcomponents/generator-element.svg',
        exampleBadgeUri: 'https://img.shields.io/david/peer/webcomponents/generator-element.svg'
      },
      {
        title: 'bitHound',
        previewBadgeUri: '/bithound/dependencies/github/rexxars/sse-channel.svg',
        exampleBadgeUri: 'https://img.shields.io/bithound/dependencies/github/rexxars/sse-channel.svg'
      },
      {
        title: 'bitHound',
        previewBadgeUri: '/bithound/devDependencies/github/rexxars/sse-channel.svg',
        exampleBadgeUri: 'https://img.shields.io/bithound/devDependencies/github/rexxars/sse-channel.svg'
      },
      {
        title: 'CocoaPods',
        previewBadgeUri: '/cocoapods/at/AFNetworking.svg',
        exampleBadgeUri: 'https://img.shields.io/cocoapods/at/AFNetworking.svg'
      },
      {
        title: 'CocoaPods',
        previewBadgeUri: '/cocoapods/aw/AFNetworking.svg',
        exampleBadgeUri: 'https://img.shields.io/cocoapods/aw/AFNetworking.svg'
      },
      {
        title: 'CocoaPods',
        previewBadgeUri: '/cocoapods/p/AFNetworking.svg',
        exampleBadgeUri: 'https://img.shields.io/cocoapods/p/AFNetworking.svg'
      },
      {
        title: 'CocoaPods',
        previewBadgeUri: '/cocoapods/metrics/doc-percent/AFNetworking.svg',
        exampleBadgeUri: 'https://img.shields.io/cocoapods/metrics/doc-percent/AFNetworking.svg'
      },
      {
        title: 'Conda',
        previewBadgeUri: '/conda/pn/conda-forge/python.svg',
        exampleBadgeUri: 'https://img.shields.io/conda/pn/conda-forge/python.svg',
        keywords: [
          'conda'
        ]
      },
      {
        title: 'Ansible Role',
        previewBadgeUri: '/ansible/role/3078.svg',
        exampleBadgeUri: 'https://img.shields.io/ansible/role/3078.svg'
      },
      {
        title: 'StackExchange',
        previewBadgeUri: '/stackexchange/tex/r/951.svg',
        exampleBadgeUri: 'https://img.shields.io/stackexchange/tex/r/951.svg'
      },
      {
        title: 'StackExchange',
        previewBadgeUri: '/stackexchange/stackoverflow/t/augeas.svg',
        exampleBadgeUri: 'https://img.shields.io/stackexchange/stackoverflow/t/augeas.svg'
      },
      {
        title: 'Issue Stats',
        previewBadgeUri: '/issuestats/i/github/expressjs/express.svg',
        exampleBadgeUri: 'https://img.shields.io/issuestats/i/github/expressjs/express.svg'
      },
      {
        title: '(long form)',
        exampleBadgeUri: 'https://img.shields.io/issuestats/i/long/github/expressjs/express.svg'
      },
      {
        title: 'Issue Stats',
        previewBadgeUri: '/issuestats/p/github/expressjs/express.svg',
        exampleBadgeUri: 'https://img.shields.io/issuestats/p/github/expressjs/express.svg'
      },
      {
        title: '(long form)',
        exampleBadgeUri: 'https://img.shields.io/issuestats/p/long/github/expressjs/express.svg'
      },
      {
        title: 'Libraries.io for releases',
        previewBadgeUri: '/librariesio/release/hex/phoenix/1.0.3.svg',
        exampleBadgeUri: 'https://img.shields.io/librariesio/release/hex/phoenix/1.0.3.svg'
      },
      {
        title: 'Libraries.io for GitHub',
        previewBadgeUri: '/librariesio/github/phoenixframework/phoenix.svg',
        exampleBadgeUri: 'https://img.shields.io/librariesio/github/phoenixframework/phoenix.svg'
      },
      {
        title: 'NetflixOSS Lifecycle',
        previewBadgeUri: '/osslifecycle/Netflix/osstracker.svg',
        exampleBadgeUri: 'https://img.shields.io/osslifecycle/Netflix/osstracker.svg'
      },
      {
        title: 'Sourcegraph for Repo Reference Count',
        previewBadgeUri: 'https://img.shields.io/sourcegraph/rrc//github.com/gorilla/mux.svg',
        exampleBadgeUri: 'https://img.shields.io/sourcegraph/rrc/github.com/gorilla/mux.svg'
      }
    ]
  }
];

module.exports = allBadgeExamples;
