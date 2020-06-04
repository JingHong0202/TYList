const Controller = require('egg').Controller,
  os = require('os')
// diskinfo = require('diskinfo')

class systemController extends Controller {
  async index() {
    let hostName = os.hostname(),
      systemType = os.type(),
      Architecture = os.arch(),
      version = os.release(),
      operation = os.uptime(),
      totalRAM = os.totalmem(),
      freeRAM = os.freemem(),
      usedRAN = await this.ctx.service.system.formatPercent(totalRAM, freeRAM),
      cpuInfo = os.cpus(),
      cwd = process.cwd(),
      course = {
        total: await this.ctx.service.system.formatbytes(process.memoryUsage().heapTotal),
        used: await this.ctx.service.system.formatbytes(process.memoryUsage().heapUsed),
        rss: await this.ctx.service.system.formatbytes(process.memoryUsage().rss),
        external: await this.ctx.service.system.formatbytes(process.memoryUsage().external)
      }
    this.ctx.body = {
      hostName,
      systemType,
      Architecture,
      version,
      operation,
      totalRAM,
      usedRAN,
      cpuInfo,
      cwd,
      course
    }
    // console.log('操作系统名：' + os.type())

    // console.log('系统 CPU 架构：' + os.arch())

    // console.log('操作系统的发行版本：' + os.release())

    // console.log('操作系统运行的时间，以秒为单位：' + os.uptime())

    // console.log('系统内存总量，单位为字节：' + os.totalmem())

    // console.log('操作系统空闲内存量，单位是字节：' + os.freemem())

    // console.log('CPU/内核的信息：')

    // console.log(os.cpus())

    // console.log('项目根目录: ' + process.cwd())

    // console.log(
    //   '分配的大小' + formatbytes(process.memoryUsage().heapTotal),
    //   '使用的大小' + formatbytes(process.memoryUsage().heapUsed),
    //   formatbytes(process.memoryUsage().rss),
    //   formatbytes(process.memoryUsage().external)
    // )
    // //当前盘符
    // var current_disk = __dirname.substr(0, 2).toLowerCase()

    // //获得所有磁盘空间
    // diskinfo.getDrives(function (err, aDrives) {
    //   //遍历所有磁盘信息
    //   for (var i = 0; i < aDrives.length; i++) {
    //     //只获取当前磁盘信息
    //     if (aDrives[i].mounted.toLowerCase() == current_disk) {
    //       //盘符号
    //       var mounted = 'mounted ' + aDrives[i].mounted
    //       //总量
    //       var total = 'total ' + (aDrives[i].blocks / 1024 / 1024 / 1024).toFixed(0) + 'gb'
    //       //已使用
    //       var used = 'used ' + (aDrives[i].used / 1024 / 1024 / 1024).toFixed(0) + 'gb'
    //       //可用
    //       var available =
    //         'available ' + (aDrives[i].available / 1024 / 1024 / 1024).toFixed(0) + 'gb'
    //       //使用率
    //       var capacity = 'capacity ' + aDrives[i].capacity

    //       console.log(
    //         mounted + '\r\n' + total + '\r\n' + used + '\r\n' + available + '\r\n' + capacity
    //       )
    //     }
    //   }
    // })
  }
  async cleanCache() {
    try {
      await this.ctx.app.runSchedule('cleanCache')
      this.ctx.body = { code: 200, msg: '成功' }
    } catch (error) {
      this.ctx.body = error.toString()
    }
  }
}

module.exports = systemController
