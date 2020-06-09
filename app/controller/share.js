const Controller = require('egg').Controller

class shareController extends Controller {
  async add() {
    try {
      this.ctx.validate({
        file: 'object'
      })
    } catch (error) {
      this.ctx.trhow(400)
    }
    let { file, pass } = this.ctx.request.body
    this.ctx.body = await this.ctx.service.share.add(file, pass)
  }
  async index() {
    this.ctx.validate(
      {
        fileid: 'string'
      },
      this.ctx.params
    )
    await this.ctx.service.share.index(this.ctx.params.fileid)
  }
  async list() {
    await this.ctx.service.share.list(this.ctx.params.fileid)
  }
  async down() {
    this.ctx.body = await this.ctx.service.share.down(
      ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
    )
  }
  async familyDown() {
    this.ctx.body = await this.ctx.service.share.FamilyDown(
      ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
    )
  }
  async all() {
    let all = await this.app.mysql.select('ty_share')
    this.ctx.body = all ? all : []
  }
  async delete() {
    let { fileId } = this.ctx.request.body
    let fileIds = [...fileId]
    let res = await this.app.mysql.delete('ty_share', {
      id: [...fileIds]
    })
    if (!res.affectedRows) {
      res = { code: 500, msg: '删除失败' }
    } else {
      res = { code: 200, msg: '删除成功' }
    }
    this.ctx.body = res
  }
  async update() {
    this.ctx.validate({
      share: 'object'
    })
    let { share } = this.ctx.request.body

    let { affectedRows } = await this.app.mysql.update('ty_share', {
      ...share
    })
    this.ctx.body = affectedRows ? { code: 200, msg: '更新成功' } : { code: 500, msg: '更新失败' }
  }
}

module.exports = shareController
