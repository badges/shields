import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'ScrutinizerQualityRedirect',
  title: 'ScrutinizerQualityRedirect',
  pathPrefix: '/scrutinizer',
})

t.create('scrutinizer quality GitHub')
  .get('/g/doctrine/orm.svg')
  .expectRedirect('/scrutinizer/quality/g/doctrine/orm.svg')

t.create('scrutinizer quality GitHub (branch)')
  .get('/g/doctrine/orm/develop.svg')
  .expectRedirect('/scrutinizer/quality/g/doctrine/orm/develop.svg')

t.create('scrutinizer quality Bitbucket')
  .get('/b/doctrine/orm.svg')
  .expectRedirect('/scrutinizer/quality/b/doctrine/orm.svg')

t.create('scrutinizer quality Bitbucket (branch)')
  .get('/b/atlassian/python-bitbucket/develop.svg')
  .expectRedirect(
    '/scrutinizer/quality/b/atlassian/python-bitbucket/develop.svg'
  )

t.create('scrutinizer quality GitLab')
  .get('/gl/gitlab-com/foo/bar.svg')
  .expectRedirect('/scrutinizer/quality/gl/gitlab-com/foo/bar.svg')

t.create('scrutinizer quality GitLab (branch)')
  .get('/gl/gitlab-com/foo/bar/develop.svg')
  .expectRedirect('/scrutinizer/quality/gl/gitlab-com/foo/bar/develop.svg')

t.create('scrutinizer quality Plain Git')
  .get('/gp/bar.svg')
  .expectRedirect('/scrutinizer/quality/gp/bar.svg')

t.create('scrutinizer quality Plain Git (branch)')
  .get('/gp/bar/develop.svg')
  .expectRedirect('/scrutinizer/quality/gp/bar/develop.svg')
