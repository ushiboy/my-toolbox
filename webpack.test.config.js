var path = require('path');
var glob = require('glob');

module.exports = {
  entry: {
    test: glob.sync(path.join(__dirname, 'test/**/*-test.js'))
  },
  output: {
    path: path.join(__dirname, '.powered-assert'),
    filename: '[name].js'
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  }
};
