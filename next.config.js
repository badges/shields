const envFlag = require('node-env-flag');
const webpack = require('webpack');
const shouldAnalyze = envFlag(process.env.ANALYZE);

module.exports = {
  webpack: config => {
    config.plugins.push(new webpack.EnvironmentPlugin({ BASE_URL: null, LONG_CACHE: null }));

    if (shouldAnalyze) {
      // We don't include webpack-bundle-analyzer in devDependencies, so  load
      // lazily.
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerPort: 8888,
        openAnalyzer: true,
      }));
    }

    config.module.loaders = (config.module.loaders || []).concat({
      test: /\.json$/,
      loader: 'json-loader',
    });

    return config;
  },
  exportPathMap: () => ({
    '/': { page: '/' },
  }),
};
