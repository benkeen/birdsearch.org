var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    app: './core/app-start.jsx',
    libs: './libs'
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: '[name].js'
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
};
