'use strict';

function findVersionByTag(data, tag) {
  let result;
  if (!data.Versions) {
    return;
  }
  for (let i = 0; !result && i < data.Versions.length; i++) {
    const versionJson = data.Versions[i];
    for (let j = 0; !result && j < versionJson.Tags.length; j++) {
      const tagJson = versionJson.Tags[j];
      if (tag === tagJson.tag) {
        result = versionJson;
      }
    }
  }
  return result;
}

module.exports = {
  findVersionByTag
}
