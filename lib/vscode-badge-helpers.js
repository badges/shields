'use strict';

//To generate API request Options for VS Code marketplace
function getVscodeApiReqOptions(packageName) {
  return {
    method: 'POST',
    url: 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery/',
    headers:
    {
      'accept': 'application/json;api-version=3.0-preview.1',
      'content-type': 'application/json'
    },
    body:
    {
      filters: [{
        criteria: [
          { filterType: 7, value: packageName }]
      }],
      flags: 914
    },
    json: true
  };
}

//To extract Statistics (Install/Rating/RatingCount) from respose object for vscode marketplace
function getVscodeStatistic(data, statisticName) {
  const statistics = data.results[0].extensions[0].statistics;
  try {
    const statistic = statistics.find(x => x.statisticName.toLowerCase() === statisticName.toLowerCase());
    return statistic.value;
  } catch (err) {
    return 0; //In case required statistic is not found means ZERO.
  }
}

module.exports = {
  getVscodeApiReqOptions,
  getVscodeStatistic
};
