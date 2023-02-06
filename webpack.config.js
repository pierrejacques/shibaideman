const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

const env = require('./script/env');

const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

const options = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    popup: path.resolve(__dirname, 'src/popup/index.tsx'),
    background: path.resolve(__dirname, 'src/background/index.ts'),
    'content-script': path.resolve(__dirname, 'src/content-script/index.ts'),
    'console-page': path.resolve(__dirname, 'src/console/index.tsx'),
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js',
    globalObject: 'globalThis'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: fileExtensions.concat('.js', '.jsx', '.ts', '.tsx'),
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', {
          loader: require.resolve('less-loader'),
          options: {
            modifyVars: {
              'primary-color': '#D4282E',
              'border-radius-base': '12px',
            },
            javascriptEnabled: true,
          }
        }],
        // exclude: /node_modules/,
      },
      {
        test: new RegExp(`.(${fileExtensions.join('|')})$`),
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(tsx?|jsx?)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.(txt|csv)$/,
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      },
    ],
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin(['build']),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
    new CopyWebpackPlugin([
      {
        from: 'static/manifest.json',
        transform(content) {
          // generates the manifest file using the package.json informations
          return Buffer.from(
            JSON.stringify({
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              ...JSON.parse(content.toString()),
            })
          );
        },
      },
      {
        from: 'static/icon-34.png',
      },
      {
        from: 'static/icon-128.png',
      },
    ]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'static', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'static', 'console.html'),
      filename: 'console.html',
      chunks: ['console-page'],
    }),
    new WriteFilePlugin(),
  ],
};

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-source-map';
}

module.exports = options;
