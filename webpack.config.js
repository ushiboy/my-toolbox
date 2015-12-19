var config = require('./webpack.common.js')();
config.devtool = 'inline-source-map';

module.exports = config;
