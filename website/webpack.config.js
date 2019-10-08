const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src', 'app.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: './dist'
  },
  module: {
    rules: [
      {
        test: /(babel-file-loader)/,
        use: 'null-loader'
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /DOCS/,
        use: {
          loader: 'docs-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Extract react types',
      template: 'public/index.html'
    }),
    new CopyPlugin([{ from: '_redirects', to: '_redirects', toType: 'file' }])
  ],
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')]
  }
};
