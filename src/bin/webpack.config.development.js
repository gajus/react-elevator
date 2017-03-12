const path = require('path');
const webpack = require('webpack');
const common = require('./webpack.config.common.js');

module.exports = {
  context: common.context,
  devtool: 'source-map',
  entry: {
    app: [
      'webpack/hot/dev-server',
      'webpack-hot-middleware/client',

      './app'
    ]
  },
  module: {
    rules: [
      {
        include: path.resolve(__dirname, '../app'),
        loader: 'babel-loader',
        test: /\.js$/
      },
      {
        loaders: [
          'style-loader?sourceMap',
          'css-loader?importLoaders=1&localIdentName=[name]___[local]___[hash:base64:5]',
          'resolve-url-loader',
          'sass-loader'
        ],
        test: /\.css/
      }
    ]
  },
  output: common.output,
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  resolve: common.resolve
};
