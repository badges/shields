import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isPipeSeparatedFrameworkVersions = Joi.string().regex(
  /^([1-9]+(\.[0-9]+)?(?: \| )?)+$/,
)

t.create('supported django versions (valid, package version in request)')
  .get('/django/djangorestframework/3.7.3.json')
  .expectBadge({
    label: 'django versions',
    message: isPipeSeparatedFrameworkVersions,
  })

t.create('supported django versions (valid, no package version specified)')
  .get('/django/djangorestframework.json')
  .expectBadge({
    label: 'django versions',
    message: isPipeSeparatedFrameworkVersions,
  })

t.create('supported django versions (no versions specified)')
  .get('/django/django/1.11.json')
  .expectBadge({
    label: 'versions',
    message: 'Django versions are missing for django/1.11',
  })

t.create('supported django versions (invalid)')
  .get('/django/not-a-package.json')
  .expectBadge({
    label: 'versions',
    message: 'package or version not found',
  })

t.create('supported plone versions (valid, package version in request)')
  .get('/plone/plone.rest/1.6.2.json')
  .expectBadge({ label: 'plone versions', message: '4.3 | 5.0 | 5.1 | 5.2' })

t.create('supported plone versions (valid, no package version specified)')
  .get('/plone/plone.rest.json')
  .expectBadge({
    label: 'plone versions',
    message: isPipeSeparatedFrameworkVersions,
  })

t.create('supported plone versions (invalid)')
  .get('/plone/not-a-package.json')
  .expectBadge({
    label: 'versions',
    message: 'package or version not found',
  })

t.create('supported zope versions (valid, package version in request)')
  .get('/zope/plone/5.2.9.json')
  .expectBadge({ label: 'zope versions', message: '4' })

t.create('supported zope versions (valid, no package version specified)')
  .get('/zope/Plone.json')
  .expectBadge({
    label: 'zope versions',
    message: isPipeSeparatedFrameworkVersions,
  })

t.create('supported zope versions (invalid)')
  .get('/zope/not-a-package.json')
  .expectBadge({
    label: 'versions',
    message: 'package or version not found',
  })

t.create('supported wagtail versions (valid, package version in request)')
  .get('/wagtail/wagtail-headless-preview/0.3.0.json')
  .expectBadge({ label: 'wagtail versions', message: '2 | 3' })

t.create('supported wagtail versions (valid, no package version specified)')
  .get('/wagtail/wagtail-headless-preview.json')
  .expectBadge({
    label: 'wagtail versions',
    message: isPipeSeparatedFrameworkVersions,
  })

t.create('supported wagtail versions (invalid)')
  .get('/wagtail/not-a-package.json')
  .expectBadge({
    label: 'versions',
    message: 'package or version not found',
  })

t.create('supported django cms versions (valid, package version in request)')
  .get('/django-cms/djangocms-ads/1.1.0.json')
  .expectBadge({
    label: 'django cms versions',
    message: '3.7 | 3.8 | 3.9 | 3.10',
  })

t.create('supported django cms versions (valid, no package version specified)')
  .get('/django-cms/djangocms-ads.json')
  .expectBadge({
    label: 'django cms versions',
    message: isPipeSeparatedFrameworkVersions,
  })

t.create('supported django cms versions (invalid)')
  .get('/django-cms/not-a-package.json')
  .expectBadge({
    label: 'versions',
    message: 'package or version not found',
  })

t.create('supported odoo versions (valid, package version in request)')
  .get('/odoo/odoo-addon-sale-tier-validation/15.0.1.0.0.6.json')
  .expectBadge({ label: 'odoo versions', message: '15.0' })

t.create('supported odoo versions (valid, no package version specified)')
  .get('/odoo/odoo-addon-sale-tier-validation.json')
  .expectBadge({
    label: 'odoo versions',
    message: isPipeSeparatedFrameworkVersions,
  })

t.create('supported odoo versions (invalid)')
  .get('/odoo/not-a-package.json')
  .expectBadge({
    label: 'versions',
    message: 'package or version not found',
  })

t.create('supported aws cdk versions (valid, package version in request)')
  .get('/aws-cdk/aws-cdk.aws-glue-alpha/2.34.0a0.json')
  .expectBadge({ label: 'aws cdk versions', message: '2' })

t.create('supported aws cdk versions (valid, no package version specified)')
  .get('/aws-cdk/aws-cdk.aws-glue-alpha.json')
  .expectBadge({
    label: 'aws cdk versions',
    message: isPipeSeparatedFrameworkVersions,
  })

t.create('supported aws cdk versions (invalid)')
  .get('/aws-cdk/not-a-package.json')
  .expectBadge({
    label: 'versions',
    message: 'package or version not found',
  })

t.create('supported jupyterlab versions (valid, package version in request)')
  .get('/jupyterlab/structured-text/0.0.2.json')
  .expectBadge({ label: 'jupyterlab versions', message: '3' })

t.create('supported jupyterlab versions (valid, no package version specified)')
  .get('/jupyterlab/structured-text.json')
  .expectBadge({
    label: 'jupyterlab versions',
    message: isPipeSeparatedFrameworkVersions,
  })

t.create('supported jupyterlab versions (invalid)')
  .get('/jupyterlab/not-a-package.json')
  .expectBadge({
    label: 'versions',
    message: 'package or version not found',
  })
