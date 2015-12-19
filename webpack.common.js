var path = require('path');
var pkg = require('./package.json');
var distDir = pkg.dist;

module.exports = function() {
  return {
    entry: {
      app: './app/scripts/app.js'
    },
    output: {
      path: path.join(__dirname, distDir, 'scripts'),
      filename: '[name].js'
    },
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
};
