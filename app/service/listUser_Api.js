const Service = require('egg').Service

class listUserApiService extends Service {
  async list() {
    let users = await this.app.mysql.select('ty_user')
    return !users ? { code: 404, msg: '还未登录,请先登录' } : users
  }
  async delete(id) {
    let res = await this.app.mysql.delete('ty_user', {
      id: id
    })
    if (!res.affectedRows) {
      res = { code: 500, msg: '删除失败' }
    } else {
      res = { code: 200, msg: '删除成功' }
    }
    return res
  }
}

module.exports = listUserApiService
