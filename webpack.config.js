const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const pkg = require('./package.json');
const webpack = require('webpack');


const config = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist/'),
		filename: 'bundle-[hash].js'
	},
	module: {
		rules: [
			{
				test: /worker-.*\.js$/,
				use: { loader: 'worker-loader' }
			},
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			}
		]
	},
	resolve: {
		extensions: ['.js']
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'src/index.html',
			templateParameters: {
				version: pkg.version
			}
		}),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
	]
};

module.exports = [
	config
];
