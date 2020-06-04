const Service = require('egg').Service

class listFileApiService extends Service {
  async list(uid, fileid = -11, page = 1) {
    let data = await this.app.mysql.get('ty_user', { uid: uid })
    if (!data) return { code: 404, msg: '还未登录,请先登录' }
    let result
    this.uid = uid
    this.fileid = fileid
    this.cookie = data.cookie
    let wd = this.ctx.query.wd ? this.ctx.query.wd : ''

    if ((await this.app.cache.has(`${uid}-${fileid}-${page}`)) && !wd) {
      result = await this.app.cache.get(`${uid}-${fileid}-${page}`)
      // result = await this.getDownloadUrls(data.cookie, result, page)
    } else {
      let { res } = await this.ctx.curl(
        `https://cloud.189.cn/v2/listFiles.action?fileId=${fileid}&mediaType=&keyword=${wd}&inGroupSpace=false&orderBy=1&order=ASC&pageNum=${page}&pageSize=100&noCache=${Math.random()}`,
        {
          headers: {
            cookie: data.cookie
          },
          dataType: 'text',
          timeout: this.app.config.myConfig.timeout
        }
      )
      if (res.status !== 200) return { code: 500, msg: 'cookie失效,请重新登录' }
      if (!wd) await this.app.cache.set(`${uid}-${fileid}-${page}`, res.data, 86400)
      // res.data = await this.getDownloadUrls(data.cookie, res.data, page)
      result = res.data
      if (result.indexOf('script') !== -1) return { code: 500, msg: 'cookie失效,请重新登录' }
    }
    return typeof result === 'object' ? result : JSON.parse(result)
  }

  async getFileInfo(fileId, cookie) {
    let {
      res: { data }
    } = await this.ctx.curl(
      `https://cloud.189.cn/v2/getFileInfo.action?fileId=${fileId}&noCache=${Math.random()}`,
      {
        headers: {
          cookie: cookie,
          referer: 'https://cloud.189.cn/main.action'
        },
        dataType: 'json',
        timeout: this.app.config.myConfig.timeout
      }
    )
    return data
  }

  async getUrl(arg, cookie) {
    return arg.map(async item => {
      let res1 = await this.ctx.curl('https:' + item.downloadUrl, {
        headers: {
          cookie: cookie,
          'user-agent': 'User-Agent,Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0',
          'Accept-Encoding': 'gzip, deflate, sdch',
          referer: 'https://cloud.189.cn/main.action'
        },
        dataType: 'text',
        timeout: this.app.config.myConfig.timeout
      })
      let res2 = await this.ctx.curl(res1.res.headers.location, {
        headers: {
          cookie: cookie,
          'user-agent': 'User-Agent,Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0',
          'Accept-Encoding': 'gzip, deflate, sdch',
          referer: 'https://cloud.189.cn/main.action'
        },
        dataType: 'text',
        timeout: this.app.config.myConfig.timeout
      })
      item.downloadUrl = res2.res.headers.location
      return item
    })
  }
  async getDownloadUrl(uid, fileid) {
    if (await this.app.cache.has(`down-${uid}-${fileid}`))
      return await this.app.cache.get(`down-${uid}-${fileid}`)

    let data = await this.app.mysql.get('ty_user', { uid: uid })
    if (!data) return { code: 404, msg: '还未登录,请先登录' }

    let fileInfo = await this.getFileInfo(fileid, data.cookie)

    let filters = [fileInfo].filter(item => item.downloadUrl)
    if (!filters.length) return { code: 500, msg: '此资源不可下载' }

    let res = await Promise.all(await this.getUrl(filters, data.cookie))
    await this.app.cache.set(`down-${uid}-${fileid}`, res, 9000)
    return res
  }
  async getDownloadUrls(uid, fileid, page) {
    let urls = await this.list(uid, fileid, page)

    if (await this.app.cache.has(`down-${this.uid}-${this.fileid}-${page}`))
      return await this.app.cache.get(`down-${this.uid}-${this.fileid}-${page}`)

    let filters = urls.data.filter(item => item.downloadUrl)
    if (!filters.length) return urls

    let res3 = await Promise.all(await this.getUrl(filters, this.cookie))
    await this.app.cache.set(`down-${this.uid}-${this.fileid}-${page}`, res3, 9000)
    return res3
  }
}

module.exports = listFileApiService
