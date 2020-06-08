const Controller = require('egg').Controller

class webdavController extends Controller {
  async index() {
    this.ctx.set({
      'Content-type': 'text/xml; charset=utf-8',
      'X-Dav-Powered-By': 'by jinghong TYList'
    })
    this.ctx.status = 207
    this.ctx.body = await this.ctx.service.webdav.index(...this.ctx.params[0].split('/'))
  }
  getRange(r, total) {
    let [, start, end] = r.match(/(\d*)-(\d*)/)
    start = start ? parseInt(start) : 0
    end = end ? parseInt(end) : total - 1

    return [start, end]
  }

  async down() {
    let send = await this.ctx.service.webdav.down(),
      url = send.res[0]['downloadUrl']

    let size = null
    if (send && send.size) {
      size = send.size
    }
    if (size) {
      size = send.size
      let chunksize = size,
        range = this.ctx.get('range')
      if (range) {
        let [start, end] = this.getRange(range, size)
        this.ctx.set('Content-Range', 'bytes ' + `${start}-${end}/${size}`)
        this.ctx.status = 206
        chunksize = end - start + 1
      } else {
        this.ctx.set('Content-Range', 'bytes ' + `0-${size - 1}/${size}`)
        this.ctx.status = 206
      }
      this.ctx.length = chunksize
    }
    this.ctx.set({
      'X-Dav-Powered-By': 'by jinghong TYList'
    })

    let res = await this.ctx.curl(url, {
      streaming: true,
      headers: {
        range: this.ctx.get('range')
      }
    })
    this.ctx.set(res.res.headers)
    this.ctx.body = res.res
  }
  async list() {
    this.ctx.set({
      'Content-type': 'text/xml; charset=utf-8',
      'X-Dav-Powered-By': 'by jinghong TYList'
    })
    this.ctx.status = 207
    this.ctx.body = await this.ctx.service.webdav.list()
  }
}

module.exports = webdavController
