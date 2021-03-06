const path = require('path')
const glob = require('glob')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = () => ({
  output: {
    publicPath: './',
    path: path.resolve(__dirname, '../dist/'),
    filename: '[name].[hash].js'
  },

  module: {
    rules: [
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        use: {
          loader: 'elm-webpack-loader',
          options: {
            optimize: false, // TODO: False just temporary in order to debug in production
          },
        },
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: true,
              compact: true,
              presets: [
                [
                  // Latest stable ECMAScript features
                  require('@babel/preset-env').default,
                  {
                    // Do not transform modules to CJS
                    modules: false
                  }
                ]
              ]
            }
          }
        ]
      },
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.(ttf|otf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?|(jpg|gif)$/,
        loader: 'file-loader'
      }
    ]
  },

  optimization: {
    minimizer: [
      // https://elm-lang.org/0.19.0/optimize
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          mangle: false,
          compress: {
            pure_funcs: ['F2','F3','F4','F5','F6','F7','F8','F9','A2','A3','A4','A5','A6','A7','A8','A9'],
            pure_getters: true,
            keep_fargs: false,
            unsafe_comps: true,
            unsafe: true,
          },
        },
      }),
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: { mangle: true },
      }),
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'src/client/css/[name].[hash].css',
    }),

    new PurgecssPlugin({
      paths: glob.sync(path.join(__dirname, '../src/client/**/*.elm'), { nodir: true }),
    }),

    /*new CopyWebpackPlugin([
      { from: 'src/client/assets/images', to: 'assets/images' },
    ]),*/ //No images yet

    new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i }),

    new OptimizeCSSAssetsPlugin()
  ]
})
