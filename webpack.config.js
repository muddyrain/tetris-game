const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

const outputPath = path.resolve(__dirname, './dist/')

/**
 * @type {import("webpack").Configuration}
 */
const config = {
  entry: {
    main: './src/index.ts',
  },
  output: {
    path: outputPath,
    filename: '[name]-[chunkhash:5].js',
  },
  resolve: {
    extensions: ['.jsx', '.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts)|(tsx)$/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devServer: {
    port: '6685',
    open: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html'),
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './public/assets/'),
          to: outputPath + '/assets',
          globOptions: {},
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
}

module.exports = config
