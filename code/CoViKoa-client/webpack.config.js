const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ReplaceHashWebpackPlugin = require('replace-hash-webpack-plugin');
const zopfli = require('@gfx/zopfli');
const { version } = require('./package.json');

module.exports = [
  {
    entry: {
      app: './src/js/app.js',
    },
    output: {
      filename: '[name].[hash:6].js',
      publicPath: '',
    },
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      browsers: [
                        'last 2 Chrome versions',
                        'last 2 Firefox versions',
                        'last 1 Safari version',
                        'last 1 Opera version',
                      ],
                    },
                  },
                ],
              ],
              plugins: ['syntax-dynamic-import'],
            },
          },
          exclude: [
            /node_modules/,
          ],
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [
                  require('autoprefixer')(), // eslint-disable-line
                ],
              },
            },
          ],
        },
        {
          test: /\.(woff(2)?|eot|otf|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts/',
            },
          },
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            'file-loader',
          ],
        },
      ],
      noParse: /\/native-require.js$/,
    },
    optimization: {
      // runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
          },
        },
      },
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanAfterEveryBuildPatterns: ['dist/*.*'],
        watch: true,
      }),
      new webpack.ProvidePlugin({
        Promise: 'bluebird',
        ol: 'ol',
      }),
      new ReplaceHashWebpackPlugin({
        cwd: 'src',
        src: '**/*.html',
        dest: 'dist',
      }),
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(version),
      }),
    ],
    watchOptions: {
      poll: true,
    },
  },
];

if (process.env.NODE_ENV === 'production') {
  // Theorically aiohttp should use the .gz version of the files when
  // they exist (https://docs.aiohttp.org/en/stable/web_reference.html#aiohttp.web.UrlDispatcher.add_static)
  module.exports[0].plugins.push(
    new CompressionPlugin({
      compressionOptions: { numiterations: 15 },
      algorithm(input, compressionOptions, callback) {
        return zopfli.gzip(input, compressionOptions, callback);
      },
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
      deleteOriginalAssets: false,
    }),
  );
  module.exports[0].optimization.minimize = true;
}
