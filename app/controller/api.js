const Controller = require('egg').Controller

class apiController extends Controller {
  async login() {
    this.ctx.validate({
      username: {
        type: 'string',
        min: 11,
        max: 11
      },
      password: 'password'
    })
    let { username, password } = this.ctx.request.body
    this.ctx.body = await this.ctx.service.loginApi.login(username, password)
  }

  async listFile() {
    this.ctx.body = await this.ctx.service.listFileApi.list(
      ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
    )
  }

  async listUser() {
    this.ctx.body = await this.ctx.service.listUserApi.list()
  }
  async deleteUser() {
    this.ctx.validate(
      {
        id: 'int'
      },
      this.ctx.params
    )
    this.ctx.body = await this.ctx.service.listUserApi.delete(
      ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
    )
  }

  async photos() {
    this.ctx.body = await this.ctx.service.photosApi.photos(
      ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
    )
  }

  async player() {
    let res = await this.ctx.service.playerApi.player(
      ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
    )
    if (res) this.ctx.body = res
  }

  async Down() {
    let res = await this.ctx.service.listFileApi.getDownloadUrl(
      ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
    )
    this.ctx.unsafeRedirect(res[0]['downloadUrl'])
  }

  // async DownAll() {
  //   this.ctx.body = await this.ctx.service.listFileApi.getDownloadUrls(
  //     ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
  //   )
  // }

  async familyPlayer() {
    let res = await this.ctx.service.playerApi.familyPlayer(
      ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
    )
    if (res) this.ctx.body = res
  }

  async family() {
    this.ctx.body = await this.ctx.service.familyApi.family(
      ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
    )
  }
  async familyInfos() {
    this.ctx.body = await this.ctx.service.familyApi.getfamilyInfos(this.ctx.params.uid)
  }
  async familySearch() {
    this.ctx.body = await this.ctx.service.familyApi.searchFile(
      ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
    )
  }
  async familyDown() {
    let res = await this.ctx.service.familyApi.getDownloadUrl(
      ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
    )
    this.ctx.unsafeRedirect(res[0]['downloadUrl'])
  }
  // async familyDownAll() {
  //   this.ctx.body = await this.ctx.service.familyApi.getDownloadUrls(
  //     ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
  //   )
  // }
  async familyGetFileInfo() {
    this.ctx.body = await this.ctx.service.familyApi.getFileInfo(
      ...Object.keys(this.ctx.params).map(item => this.ctx.params[item])
    )
  }
}

module.exports = apiController
