const Controller = require('egg').Controller

class authController extends Controller {
  async index() {
    this.ctx.validate({
      secret: {
        type: 'string'
      }
    })
    let reverse = this.app.config.jwt.secret.split('').reverse().join(''),
      { secret } = this.ctx.request.body
    if (secret !== this.ctx.app.config.jwt.secret) {
      throw new Error('认证失败,秘钥错误')
    }

    this.ctx.body = {
      access: this.app.jwt.sign(
        {
          secret
        },
        reverse,
        {
          expiresIn: '24h'
        }
      )
    }
  }
}
module.exports = authController
