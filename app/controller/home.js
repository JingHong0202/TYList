const Controller = require('egg').Controller

class homeController extends Controller {
  async index() {
    this.ctx.unsafeRedirect('/index.html')
  }
}

module.exports = homeController
