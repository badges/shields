import { InvalidResponse, pathParams } from '../index.js'
import PypiBase, { pypiBaseUrlParam } from './pypi-base.js'
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

const description = `
This service currently support the following Frameworks: <br/>
${Object.values(frameworkNameMap).map(obj => ` <strong>${obj.name}</strong>`)}
`
export default class PypiFrameworkVersion extends PypiBase {
  static category = 'platform-support'

  static route = {
    base: 'pypi/frameworkversions',
    pattern: `:frameworkName(${Object.keys(frameworkNameMap).join(
      '|',
    )})/:packageName+`,
  }

  static openApi = {
    '/pypi/frameworkversions/{frameworkName}/{packageName}': {
      get: {
        summary: 'PyPI - Versions from Framework Classifiers',
        description,
        parameters: pathParams(
          {
            name: 'frameworkName',
            example: 'plone',
            schema: { type: 'string', enum: Object.keys(frameworkNameMap) },
          },
          { name: 'packageName', example: 'plone.volto' },
        ).concat(pypiBaseUrlParam),
      },
    },
  }

  static defaultBadgeData = { label: 'versions' }

  static render({ name, versions }) {
    name = name ? name.toLowerCase() : ''
    const label = `${name} versions`
    return {
      label,
      message: sortPypiVersions(versions).join(' | '),
      color: 'blue',
    }
  }

  async handle({ frameworkName, packageName }, { pypiBaseUrl }) {
    const classifier = frameworkNameMap[frameworkName]
      ? frameworkNameMap[frameworkName].classifier
      : frameworkName
    const name = frameworkNameMap[frameworkName]
      ? frameworkNameMap[frameworkName].name
      : frameworkName
    const regex = new RegExp(`^Framework :: ${classifier} :: ([\\d.]+)$`)
    const packageData = await this.fetch({ egg: packageName, pypiBaseUrl })
    const versions = parseClassifiers(packageData, regex)

    if (versions.length === 0) {
      throw new InvalidResponse({
        prettyMessage: `${name} versions are missing for ${packageName}`,
      })
    }

    return this.constructor.render({ name, versions })
  }
}
