import PypiBase from './pypi-base.js'
import { sortPypiVersions, parseClassifiers } from './pypi-helpers.js'

const frameworkNameMap = {
  'aws-cdk': {
    name: 'AWS CDK',
    classifier: 'AWS CDK',
  },
  django: {
    name: 'Django',
    classifier: 'Django',
  },
  'django-cms': {
    name: 'Django CMS',
    classifier: 'Django CMS',
  },
  jupyterlab: {
    name: 'JupyterLab',
    classifier: 'Jupyter :: JupyterLab',
  },
  odoo: {
    name: 'Odoo',
    classifier: 'Odoo',
  },
  plone: {
    name: 'Plone',
    classifier: 'Plone',
  },
  wagtail: {
    name: 'Wagtail',
    classifier: 'Wagtail',
  },
  zope: {
    name: 'Zope',
    classifier: 'Zope',
  },
}

const documentation = `
<p>
  This service currently support the following Frameworks: <br/>
  ${Object.values(frameworkNameMap).map(obj => `<strong>${obj.name}</strong>`)}
</p>
`
export default class PypiFrameworkVersion extends PypiBase {
  static category = 'platform-support'

  static route = {
    base: 'pypi/frameworkversions',
    pattern: `:frameworkName(${Object.keys(frameworkNameMap).join(
      '|'
    )})/:packageName*`,
  }

  static examples = [
    {
      title: 'PyPI - Versions from Framework Classifiers',
      namedParams: {
        frameworkName: 'Plone',
        packageName: 'plone.volto',
      },
      staticPreview: this.render({
        name: 'Plone',
        versions: ['5.2', '6.0'],
      }),
      keywords: ['python'],
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'versions' }

  static render({ name, versions }) {
    name = name ? name.toLowerCase() : ''
    const label = `${name} versions`
    if (versions.length > 0) {
      return {
        label,
        message: sortPypiVersions(versions).join(' | '),
        color: 'blue',
      }
    } else {
      return {
        label,
        message: 'missing',
        color: 'red',
      }
    }
  }

  async handle({ frameworkName, packageName }) {
    const classifier = frameworkNameMap[frameworkName]
      ? frameworkNameMap[frameworkName].classifier
      : frameworkName
    const name = frameworkNameMap[frameworkName]
      ? frameworkNameMap[frameworkName].name
      : frameworkName
    const regex = new RegExp(`^Framework :: ${classifier} :: ([\\d.]+)$`)
    const packageData = await this.fetch({ egg: packageName })
    const versions = parseClassifiers(packageData, regex)

    return this.constructor.render({ name, versions })
  }
}
