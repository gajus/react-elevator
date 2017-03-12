const path = require('path');

module.exports = {
  context: path.join(__dirname, '..'),
  output: {
    chunkFilename: '[name].js',
    filename: '[name].js',
    path: path.join(__dirname, '../../dist/client'),
    publicPath: '/static/'
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom')
    }
  }
};
