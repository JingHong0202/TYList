const Service = require('egg').Service

class systemService extends Service {
  async formatbytes(num) {
    return (num / 1024 / 1024).toFixed(2) + 'MB'
  }
  async formatPercent(total, free) {
    let used = total - free
    return ~~((used / total) * 100)
  }
}

module.exports = systemService
