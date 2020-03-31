const fs = require('fs');
const path = require('path');

const getTemplate = (template) => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, template), 'utf-8'))
}

const mockPackageData = (packageName, engines, scope, tag, registry) => (nock) => {
  let packageJson;
  let urlPath;
  if (scope || tag) {
    if (scope) {
      urlPath = `/${scope}%2F${packageName}`
    } else {
      urlPath = `/${packageName}`;
    }
    packageJson = getTemplate('packageJsonVersionsTemplate.json')
    packageJson.name = packageJson
    packageJson['dist-tags'][tag || 'latest'] = '0.0.91'
    packageJson.versions['0.0.91'].name = packageName;
    packageJson.versions['0.0.91'].engines.node = engines;
  } else {
    urlPath = `/${packageName}/latest`;
    packageJson = getTemplate('packageJsonTemplate.json')
    packageJson.name = packageName;
    packageJson.engines.node = engines;
  }
  return nock(registry || 'https://registry.npmjs.org/')
    .get(urlPath)
    .reply(200, packageJson)
}

const mockNonExistingPackageData = (packageName) => (nock) => {
  return nock('https://registry.npmjs.org/')
    .get(`/${packageName}/latest`)
    .reply(404)
}

const mockCurrentSha = (latestVersion) => (nock) => {
  const latestSha = `node-v${latestVersion}.12.0-aix-ppc64.tar.gz`
  return nock('https://nodejs.org/dist/')
    .get(`/latest/SHASUMS256.txt`)
    .reply(200, latestSha)
}

module.exports = {
  mockNonExistingPackageData,
  mockPackageData,
  mockCurrentSha,
}
