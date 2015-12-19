var path = require('path');
var pkg = require('./package.json');
var distDir = pkg.dist;
module.exports = {
  entry: {
    app: './app/scripts/app.js'
  },
  output: {
    path: path.join(__dirname, distDir, 'scripts'),
    filename: '[name].js'
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  }
};
