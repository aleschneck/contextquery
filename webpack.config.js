const path = require('path');

module.exports = [
  {
    mode: 'production',
    entry: {
      index: './src/context.js'
    },
    output: {
      filename: 'context.min.js',
      path: path.resolve(__dirname, 'dist')
    }
  },
  {
    mode: 'development',
    entry: {
      index: './src/context.js'
    },
    devtool: 'source-map',
    output: {
      filename: 'context.js',
      path: path.resolve(__dirname, 'example/js')
    }
  }
]
