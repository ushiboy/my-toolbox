var config = require('./webpack.common.js')();
var webpack = require('webpack');
config.plugins = [
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  })
];

module.exports = config;
