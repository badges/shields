const webpack = require('webpack');

module.exports = {
  webpack: config => {
    config.plugins.push(new webpack.EnvironmentPlugin(['BASE_URL']));
    config.plugins.push(new webpack.EnvironmentPlugin({ PRODUCTION_BUILD: null }));
    return config;
  },
  exportPathMap: () => ({
    '/': { page: '/' },
  }),
};
