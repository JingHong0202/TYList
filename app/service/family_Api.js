const Service = require('egg').Service
const parser = require('fast-xml-parser')

class familyApiService extends Service {
  async family(uid, fileId = '', page = 1) {
    let familyId = this.ctx.query.family
    this.familyId = familyId
    let result
    if (await this.app.cache.has(`${familyId}-${fileId}-${page}`)) {
      result = await this.app.cache.get(`${familyId}-${fileId}-${page}`)
    } else {
      let user = await this.app.mysql.get('ty_user', { uid: uid })
      if (!user) this.ctx.throw('没有此用户')
      let { sessionKey_family, sessionSecret } = user,
        GMT = new Date().toGMTString()
      let Signature = await this.ctx.helper.getSignature(
        '/family/file/listFiles.action',
        sessionKey_family,
        sessionSecret,
        'GET',
        GMT
      )
      let {
        res: { data }
      } = await this.ctx.curl(
        `https://api.cloud.189.cn/family/file/listFiles.action?channelId=anzhi&version=8.6.0&familyId=${familyId}&fileType=0&mediaType=0&folderId=${fileId}&iconOption=15&orderBy=3&descending=true&pageNum=${page}&pageSize=100`,
        {
          headers: {
            host: 'api.cloud.189.cn',
            SessionKey: sessionKey_family,
            Signature: Signature,
            Date: GMT,
            Connection: 'keep-alive',
            Accept: '*/*',
            'Accept-Encoding': 'gzip, deflate, br'
          },
          timeout: this.app.config.myConfig.timeout,
          dataType: 'text'
        }
      )
      result = parser.parse(data, {
        parseTrueNumberOnly: true
      })
      await this.app.cache.set(`${familyId}-${fileId}-${page}`, result, 86400)
    }

    return result
  }

  async getDownloadUrl(uid, familyId, fileid) {
    if (await this.app.cache.has(`down-${familyId}-${fileid}`))
      return await this.app.cache.get(`down-${familyId}-${fileid}`)
    let res = await Promise.all(await this.getUrl([{ id: fileid }], familyId, uid))
    await this.app.cache.set(`down-${familyId}-${fileid}`, res, 9000)
    return res
  }
  // async getDownloadUrls(uid, fileid, page) {
  //   let urls = await this.family(uid, fileid, page)
  //   if (await this.app.cache.has(`down-${this.familyId}-${fileid}-${page}`)) {
  //     return await this.app.cache.get(`down-${this.familyId}-${fileid}-${page}`)
  //   }
  //   let list = urls.listFiles.fileList
  //   if (!list.file) return list
  //   let res = await Promise.all(await this.getUrl(list.file, this.familyId))
  //   list.file = res
  //   await this.app.cache.set(`down-${this.familyId}-${fileid}-${page}`, list, 9000)
  //   return list
  // }

  async getFileInfo(uid, familyId, fileId) {
    if (await this.app.cache.has(`${familyId}-${fileId}`))
      return await this.app.cache.get(`${familyId}-${fileId}`)

    //getuser
    let user = await this.app.mysql.get('ty_user', { uid: uid })
    if (!user) this.ctx.throw('没有此用户')
    let { sessionKey_family, sessionSecret } = user

    // getSignature
    let GMT = new Date().toGMTString()
    let Signature = await this.ctx.helper.getSignature(
      '/family/file/getFolderInfo.action',
      sessionKey_family,
      sessionSecret,
      'GET',
      GMT
    )

    let {
      res: { data }
    } = await this.ctx.curl(
      `https://api.cloud.189.cn/family/file/getFolderInfo.action?familyId=${familyId}&folderId=${fileId}&folderPath=&pathList=1&clientType=TELEPC&version=6.2.3.0&channelId=web_cloud.189.cn&rand=31902_16497406`,
      {
        headers: {
          Signature: Signature,
          Date: GMT,
          SessionKey: sessionKey_family,
          Host: 'api.cloud.189.cn'
        },
        timeout: this.app.config.myConfig.timeout,
        dataType: 'text'
      }
    )
    let { folder } = parser.parse(data, {
      parseTrueNumberOnly: true
    })
    await this.app.cache.set(`${familyId}-${fileId}`, folder, 86400)
    return folder
  }
  async getUrl(list, familyId, uid) {
    let user = await this.app.mysql.get('ty_user', { uid: uid })
    if (!user) this.ctx.throw('没有此用户')
    // getSignature
    let GMT = new Date().toGMTString(),
      { sessionKey_family, sessionSecret } = user,
      Signature = await this.ctx.helper.getSignature(
        '/family/file/getFileDownloadUrl.action',
        sessionKey_family,
        sessionSecret,
        'GET',
        GMT
      )
    return list.map(async item => {
      let fileId = item.id
      let {
        res: { data }
      } = await this.ctx.curl(
        `https://api.cloud.189.cn/family/file/getFileDownloadUrl.action?familyId=${familyId}&fileId=${fileId}&clientType=TELEPC&version=6.2.3.0&channelId=web_cloud.189.cn&rand=1646_17266562`,
        {
          headers: {
            Date: GMT,
            Signature: Signature,
            SessionKey: sessionKey_family,
            Host: 'api.cloud.189.cn'
          },
          dataType: 'text',
          timeout: this.app.config.myConfig.timeout
        }
      )
      let { fileDownloadUrl } = parser.parse(data, {
        parseTrueNumberOnly: true
      })

      if (!fileDownloadUrl) this.ctx.throw('获取链接失败')
      fileDownloadUrl = fileDownloadUrl.replace(/amp;/g, '')

      let {
        res: {
          headers: { location }
        }
      } = await this.ctx.curl(fileDownloadUrl)
      if (!location) this.ctx.throw('获取链接失败')
      item.downloadUrl = location
      return item
    })
  }
  async searchFile(uid, familyId, wd, page = 1) {
    //cache
    if (await this.app.cache.has(`${familyId}-${wd}-${page}`))
      return await this.app.cache.get(`${familyId}-${wd}-${page}`)

    //getuser
    let user = await this.app.mysql.get('ty_user', { uid: uid })
    if (!user) this.ctx.throw('没有此用户')
    let { sessionSecret, sessionKey_family } = user

    // getSignature
    let GMT = new Date().toGMTString()
    let Signature = await this.ctx.helper.getSignature(
      '/family/file/searchFiles.action',
      sessionKey_family,
      sessionSecret,
      'GET',
      GMT
    )

    let {
      res: { data }
    } = await this.ctx.curl(
      `https://api.cloud.189.cn/family/file/searchFiles.action?familyId=${familyId}&fileName=${wd}&fileType=0&iconOption=0&mediaAttr=0&orderBy=3&descending=true&pageNum=${page}&pageSize=100&recursive=1&clientType=TELEPC&version=6.2.3.0&channelId=web_cloud.189.cn&rand=2548_9875703`,
      {
        headers: {
          Date: GMT,
          SessionKey: sessionKey_family,
          Signature: Signature
        },
        dataType: 'text'
      }
    )

    if (!data) {
      return { code: 404, msg: '搜索不到任何数据' }
    }

    let { searchFileList } = parser.parse(data, {
      parseTrueNumberOnly: true
    })

    await this.app.cache.set(`${familyId}-${wd}-${page}`, searchFileList, 86400)

    return searchFileList
  }
  // async getUserInfo(uid) {
  //   console.log(uid)
  //   let user = await this.app.mysql.get('ty_user', { uid: uid })
  //   if (!user) this.ctx.throw('没有此用户')
  //   return user
  // }
  async getfamilyInfos(uid) {
    // cache
    if (await this.app.cache.has(`${uid}-familyInfo`))
      return await this.app.cache.get(`${uid}-familyInfo`)
    //getuser
    let user = await this.app.mysql.get('ty_user', { uid: uid })
    if (!user) this.ctx.throw('没有此用户')
    // getSignature
    let GMT = new Date().toGMTString()
    let Signature = await this.ctx.helper.getSignature(
      '/family/manage/getFamilyList.action',
      user.sessionKey_family,
      user.sessionSecret,
      'GET',
      GMT
    )
    let {
      res: { data }
    } = await this.ctx.curl(
      'https://api.cloud.189.cn/family/manage/getFamilyList.action?clientType=TELEPC&version=6.2.3.0&channelId=web_cloud.189.cn&rand=30204_15977500',
      {
        headers: {
          SessionKey: user.sessionKey_family,
          Signature: Signature,
          Date: GMT,
          host: 'api.cloud.189.cn'
        },
        dataType: 'text',
        timeout: this.app.config.myConfig.timeout
      }
    )
    var jsonObj = parser.parse(data, {
      parseTrueNumberOnly: true
    })
    if (jsonObj.error) return this.ctx.throw('获取家庭列表失败')
    await this.app.cache.set(`${uid}-familyInfo`, jsonObj.familyListResponse, 86400 * 7)
    return jsonObj.familyListResponse
  }
}

module.exports = familyApiService
