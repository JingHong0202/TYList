const Service = require('egg').Service

class playerApiService extends Service {
  async player(uid, fileId) {
    let result
    if (await this.app.cache.has(`down-${uid}-${fileId}`)) {
      result = await this.app.cache.get(`down-${uid}-${fileId}`)
    }

    let info = await this.app.mysql.get('ty_user', { uid: uid })
    if (!info) return { code: 404, msg: '还未登录,请先登录' }

    let data = await this.ctx.service.listFileApi.getFileInfo(fileId, info.cookie),
      fileType = data.fileType
    if (fileType !== 'mp4' && fileType !== 'mp3')
      return { code: 400, msg: data.fileName + '不是可播放文件' }

    result = await Promise.all(await this.ctx.service.listFileApi.getUrl([data], info.cookie))
    await this.app.cache.set(`down-${uid}-${fileId}`, result, 9000)
    return await this.ctx.render(fileType === 'mp4' ? 'player.ejs' : 'player-mp3.ejs', {
      downloadUrl: result[0].downloadUrl,
      title: result[0].fileName
    })
  }
  async familyPlayer(uid, familyId, fileId) {
    let result, fileType
    if (await this.app.cache.has(`down-${familyId}-${fileId}`)) {
      result = await this.app.cache.get(`down-${familyId}-${fileId}`)
      fileType = result[0].name.match(/\.(mp4)|(mp3)$/i)
    } else {
      let data = await this.ctx.service.familyApi.getFileInfo(uid, familyId, fileId)
      fileType = data.name.match(/\.(mp4)|(mp3)$/i)
      if (fileType[1] !== 'mp4' && fileType[2] !== 'mp3')
        return { code: 400, msg: data.name + '不是可播放文件' }
      result = await Promise.all(await this.ctx.service.familyApi.getUrl([data], familyId, uid))
      await this.app.cache.set(`down-${familyId}-${fileId}`, result, 9000)
    }
    return await this.ctx.render(fileType[1] ? 'player.ejs' : 'player-mp3.ejs', {
      downloadUrl: result[0].downloadUrl,
      title: result[0].name
    })
  }
}

module.exports = playerApiService
