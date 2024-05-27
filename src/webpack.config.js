const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');

// Carica le variabili d'ambiente dal file .env
dotenv.config();

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    // Plugin per definire le variabili d'ambiente
    new webpack.DefinePlugin({
      'process.env.REACT_APP_SYNCFUSION_API_KEY': JSON.stringify(process.env.REACT_APP_SYNCFUSION_API_KEY)
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
};
