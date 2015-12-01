var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    app: './core/init.jsx',
    libs: [
      './libs/bootstrap-modal.js',
      './libs/bootstrap-transition.js',
      './libs/gmaps.inverted.circle.js',
      './libs/html5shiv.js'
    ]
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: '[name]-[hash].js'
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  plugins: [
    function() {
      this.plugin("done", function(stats) {
        require("fs").writeFileSync(
          path.join(__dirname, "./", "stats.json"),
          JSON.stringify(stats.toJson()));
      });
    }
  ]
};
