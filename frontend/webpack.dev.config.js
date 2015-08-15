'use strict';

var config = require('./webpack.base.config.js');

config.devServer = {
  contentBase: 'src',
  https: false,
  stats: {
    colors: true
  },
  historyApiFallback: true
};

config.module.loaders = config.module.loaders.concat([
  {test: /\.jsx?$/, loaders: [
    'react-hot',
    'babel',
    'flowcheck',
    'babel?blacklist=flow&optional=runtime'],
    exclude: /node_modules/},
  {test: /\.json$/, loader: 'json-loader' },
  {test: /\.css$/, loader: 'style!css?importLoaders=1!postcss'},
  {test: /localforage\/dist\/localforage.js/, loader: 'exports?localforage'},
  {test: /[\/](localforage|indexeddb|localstorage|websql)\.js$/,loaders: ['imports?this=>window']}
]);

config.module.noParse = [/localforage\/dist\/localforage.js/];

config.node = {
  fs: 'empty',
  net: 'empty',
  tls: 'empty'
};

module.exports = config;
