const Service = require('egg').Service

class shareService extends Service {
  randomCode() {
    let dictionary = '1234567890abcdefghijklmnopqrstuvwsyzABCDEFGHIJKLMNOPQRSTUVWSYZ'
    return [0, 0, 0, 0]
      .map(() => {
        return dictionary[~~(Math.random() * dictionary.length)]
      })
      .join('')
  }
  async add(file, pass) {
    if (
      !(await this.app.mysql.get('ty_share', {
        id: file.key
      }))
    ) {
      if (pass === 'random') {
        pass = this.randomCode()
      } else if (pass === '') {
        pass = ''
      }

      let { affectedRows } = await this.app.mysql.insert('ty_share', {
        id: file.fileId,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize ? file.fileSize : '无',
        user: file.user,
        expired: file.expired,
        category: file.category,
        add_time: ~~(new Date().getTime() / 1000),
        pass: pass
      })
      return affectedRows
        ? { code: 200, msg: '分享成功,可以到分享管理查看', pass: pass }
        : {
            code: 400,
            msg: '分享失败'
          }
    } else {
      this.ctx.throw('该文件已分享')
    }
  }
  isExpired(addtime, expired) {
    if (+expired === 0) {
      return false
    }
    return Math.abs(addtime - ~~(new Date().getTime() / 1000)) > expired
  }
  async down(parent, fileId) {
    let is = await this.app.mysql.get('ty_share', { id: parent })
    if (is) {
      let res = await this.ctx.service.listFileApi.getDownloadUrl(is.user, fileId)
      return res
    }
    this.ctx.throw(403)
  }
  async FamilyDown(parent, fileId) {
    let is = await this.app.mysql.get('ty_share', { id: parent })
    if (is) {
      let familyId = (await this.ctx.service.familyApi.getfamilyInfos(is.user)).familyInfo.find(
        item => item.remarkName === +is.user
      ).familyId
      let res = await this.ctx.service.familyApi.getDownloadUrl(is.user, familyId, fileId)
      return res
    }
    this.ctx.throw(403)
  }
  async index(fileId) {
    let file = await this.app.mysql.get('ty_share', {
      id: fileId
    })
    if (!file) this.ctx.throw(404)
    if (this.ctx.query.code) {
      if (this.ctx.query.code === file.pass) {
        this.ctx.cookies.set(fileId, this.ctx.query.code, {
          overwrite: true
        })
        this.ctx.throw(200)
      } else {
        this.ctx.throw('密码错误')
      }
    }
    if (this.ctx.cookies.get(fileId) === file.pass) {
      return this.ctx.unsafeRedirect('/shareList/' + fileId)
    }
    if (file) {
      if (this.isExpired(file.add_time, file.expired)) {
        return await this.ctx.render('share-pass.ejs', {
          expired: true,
          title: file.fileName,
          fileId: fileId
        })
      }
      if (file.pass) {
        return await this.ctx.render('share-pass.ejs', {
          fileId: fileId,
          expired: false,
          title: file.fileName
        })
      }
      return this.ctx.unsafeRedirect('/shareList/' + fileId)
    }
    this.ctx.throw(400)
  }
  async list(fileId) {
    let file = await this.app.mysql.get('ty_share', {
      id: fileId
    })
    if (!file) this.ctx.throw(404)
    if (this.ctx.cookies.get(fileId) === file.pass || !file.pass) {
      if (file.category === '个人云') {
        if (this.ctx.query.getlist) {
          let { page, fileId } = this.ctx.query
          return (this.ctx.body = await this.ctx.service.listFileApi.list(file.user, fileId, page))
        }
        await this.ctx.render('share-list.ejs', {
          data: file,
          title: file.fileName
        })
      } else {
        let familyId = (await this.ctx.service.familyApi.getfamilyInfos(file.user)).familyInfo.find(
          item => item.remarkName === +file.user
        ).familyId

        if (this.ctx.query.getlist) {
          let { page, fileId } = this.ctx.query
          this.ctx.query.family = familyId
          return (this.ctx.body = await this.ctx.service.familyApi.family(file.user, fileId, page))
        }
        await this.ctx.render('family-share-list.ejs', {
          data: file,
          title: file.fileName,
          familyId
        })
      }
    } else {
      this.ctx.unsafeRedirect('/share/' + file.id)
    }
  }
}

module.exports = shareService
