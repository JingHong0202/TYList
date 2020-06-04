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
  async down() {
    this.ctx.set({
      'Content-type': '*/*;',
      'X-Dav-Powered-By': 'by jinghong TYList'
    })
    let res = await this.ctx.service.webdav.down()
    this.ctx.unsafeRedirect(res[0]['downloadUrl'])
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
