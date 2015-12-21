var path = require('path');
var pkg = require('./package.json');
var distDir = path.join(__dirname, pkg.dist);

module.exports = function() {
  return {
    entry: {
      app: './app/scripts/app.js'
    },
    output: {
      path: path.join(distDir, 'scripts'),
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
