const Service = require('egg').Service

class photosApi extends Service {
  async photos(uid, parentId, page = 1) {
    let data = await this.app.mysql.get('ty_user', { uid: uid })
    if (!data) return { code: 404, msg: '还未登录,请先登录' }
    let result
    if (await this.app.cache.has(`photos-${uid}-${parentId}-${page}`)) {
      result = await this.app.cache.get(`photos-${uid}-${parentId}-${page}`)
    } else {
      let { res } = await this.ctx.curl(
        `https://cloud.189.cn/v2/getPhotoPreviewList.action?pageNum=${page}&pageSize=6000&orderBy=1&order=ASC&noCache=${Math.random()}&parentId=${parentId}`,
        {
          headers: {
            cookie: data.cookie
          },
          dataType: 'text'
        }
      )
      if (res.status === 302) return { code: 500, msg: 'cookie失效,请重新登录' }
      await this.app.cache.set(`photos-${uid}-${parentId}-${page}`, res.data, 86400)
      result = res.data
    }

    return JSON.parse(result)
  }
}

module.exports = photosApi
