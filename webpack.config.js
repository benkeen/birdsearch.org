var path = require('path');
var webpack = require('webpack');
var Clean = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');


// urgh. Webpack is NOT exactly intuitive.
module.exports = {
  entry: {
    app: './core/init.jsx',
    libs: [
      './libs/bootstrap-modal.js',
      './libs/bootstrap-transition.js',
      './libs/gmaps.inverted.circle.js',
      './libs/modernizr-2.0.6.min.js',
      './libs/html5shiv.js'

//<script src="libs/html5shiv.js"></script>
//<script src="libs/modernizr-2.0.6.min.js"></script>
//<script src="libs/jquery-ui-1.10.3.custom.min.js"></script>
//<script src="libs/jquery.tablesorter.min.js"></script>
//<script src="libs/jquery.tablesorter.widgets.js"></script>
//<script src="libs/jquery.metadata.js"></script>
//<script src="libs/spinners.min.js"></script>
//<script src="libs/gmaps.inverted.circle.js"></script>
//<script src="libs/bootstrap-modal.js"></script>
//<script src="libs/bootstrap-transition.js"></script>
    ]
  },
  output: {
    path: path.join(__dirname, '/public'),
    filename: 'dist/[name]-[hash].js'
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
    new Clean(['dist']), // runs before the build. Wipes out the old fist folder
    new HtmlWebpackPlugin({  // Also generate a test.html
      filename: 'index.html',
      template: 'core/templates/index.html',
      inject: 'body'
    })
  ]
};
