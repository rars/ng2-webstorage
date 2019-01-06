const wmerge = require('webpack-merge');
const common = require('./webpack.common');
const path = require('path');

module.exports = wmerge(common, {
  resolve: {
    modules: ['lib', 'node_modules']
  },

  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        loader: 'istanbul-instrumenter-loader',
        include: path.join(__dirname, 'lib'),
        exclude: [/\.(e2e|spec)\.ts$/, /node_modules/],
        enforce: 'post'
      },
      {
        test: /\.(spec|e2e)\.ts$/,
        loader: 'ts-loader',
        query: { transpileOnly: true }
      }
    ]
  }
});
