const webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  cache: true,
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'tslint-loader',
        exclude: [/node_modules/],
        enforce: 'pre',
        options: {
          emitErrors: false,
          failOnHint: false,
          resourcePath: 'src'
        }
      },
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [/node_modules\/rxjs/],
        enforce: 'pre'
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        query: { transpileOnly: true },
        exclude: [/\.(spec|e2e)\.ts$/]
      }
    ]
  },

  optimization: {
    noEmitOnErrors: true
  },

  node: {
    global: true,
    progress: false,
    crypto: 'empty',
    module: false,
    clearImmediate: false,
    setImmediate: false
  }
};
