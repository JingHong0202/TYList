const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  outputDir: '../dist',
  transpileDependencies: ['vue-echarts', 'resize-detector'],
  configureWebpack: config => {
    config.resolve = {
      extensions: ['.js', '.vue', '.json', '.styl'],
      alias: {
        widget: resolve('src/components/widget'),
        mixins: resolve('src/assets/mixins'),
        js: resolve('src/assets/js'),
        '@': resolve('src')
      }
    }
  }
}
