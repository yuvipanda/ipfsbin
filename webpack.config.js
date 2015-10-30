var path = require('path');
var webpack = require('webpack');
var OfflinePlugin = require('offline-plugin');

var config = {
  entry: [
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['react-hot', 'babel'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.json$/, loader: "json-loader"
      }
    ]
    },
	node: {
		fs: 'empty'
	}
}

var offline_plugin = new OfflinePlugin({
  version: () => {
    if(process.env.DEV) {
      return (new Date()).toString()
    } else {
      return 'v3'
    }
  },
  ServiceWorker: false,
  AppCache: {
    directory: '/'
  },
  caches: {
    main: ['bundle.js'],
    additional: ['src/base16-dark.css', 'src/codemirror.css']
  },
  rewrites: (arg) => {
    if(arg.indexOf('bundle') !== -1) {
      return 'dist/' + arg
    } else {
      return arg
    }
  }
})

if(process.env.DEV) {
  config.plugins = [
    new webpack.HotModuleReplacementPlugin(),
    offline_plugin
  ]
  config.entry.push('webpack-dev-server/client?http://localhost:3000')
  config.entry.push('webpack/hot/only-dev-server')
  config.devtool = 'eval'
} else {
  config.plugins = [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress : {
        // TODO removes all the modes from codemirror (facepalm)
        'unused'    : false,
        'dead_code' : false,
        'warnings': false
      }
    }),
    offline_plugin
  ]
}

module.exports = config

