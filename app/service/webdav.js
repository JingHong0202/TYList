const Service = require('egg').Service,
  mime = require('mime')

class webdavService extends Service {
  async index() {
    let NewArg = [].slice.call(arguments)
    !arguments[arguments.length - 1] ? NewArg.splice(NewArg.length - 1, 1) : ''
    let file = await this.app.mysql.get('ty_share', {
      id: arguments[0]
    })
    if (!file) this.ctx.throw(404)
    if (
      NewArg.length >= 2 &&
      NewArg[NewArg.length - 1] !== 'webdav' &&
      NewArg[NewArg.length - 1] !== ':7001'
    ) {
      return await this.list(file, NewArg[NewArg.length - 1])
    }
    let list = await this.getList(file)
    return await this.formatData(list, file)
  }
  async getList(share, id = false) {
    let res
    switch (share.category) {
      case '家庭云':
        let familyId = await this.ctx.service.familyApi.getfamilyInfos(share.user)
        if (!familyId) this.ctx.throw(400)
        familyId = familyId.familyInfo.find(item => item.remarkName === +share.user).familyId
        this.ctx.query.family = familyId
        res = await this.ctx.service.familyApi.getDownloadUrls(share.user, familyId, id || share.id)
        break
      case '个人云':
        let data = await this.ctx.service.listFileApi.getDownloadUrls(share.user, id || share.id)
        data = this.unity(data)
        let folder = data.filter(item => item.isFolder),
          file = data.filter(item => !item.isFolder)
        res = { folder, file }
        break
      default:
    }
    return res
  }
  unity(list) {
    list = list.data ? list.data : list
    return list.map(item => {
      return Object.assign(item, {
        name: item.fileName,
        id: item.fileId,
        createDate: item.createTime,
        size: item.fileSize ? item.fileSize : 0
      })
    })
  }
  async formatData(list, share) {
    let folder =
        list.folder && list.folder.length !== 0
          ? list.folder.length
            ? list.folder
            : [list.folder]
          : [],
      file =
        list.file && list.file.length !== 0 ? (list.file.length ? list.file : [list.file]) : [],
      isFamily = share.category === '家庭云' ? '&amp;familyId=' + this.ctx.query.family : ''
    file = file.map(item => {
      return `<D:response>
		<D:href>${item.downloadUrl}</D:href>
		<D:propstat>
			<D:status>HTTP/1.1 200 OK</D:status>
			<D:prop>
				<D:getlastmodified>${new Date(item.lastOpTime).toGMTString()}</D:getlastmodified>
				<D:getcontentlength>${item.size}</D:getcontentlength>
				<D:getcontenttype>${mime.getType(item.name)}</D:getcontenttype>
				<D:creationdate>${new Date(item.createDate).toGMTString()}</D:creationdate>
				<D:resourcetype/>
				<D:displayname>${item.name}</D:displayname>
			</D:prop>
		</D:propstat>
	</D:response>`
    })
    folder = folder.map(item => {
      return `<D:response>
        <D:href>${item.id}</D:href>
        <D:propstat>
            <D:status>HTTP/1.1 200 OK</D:status>
            <D:prop>
                <D:getlastmodified>${new Date(item.lastOpTime).toGMTString()}</D:getlastmodified>
                <D:getcontentlength>0</D:getcontentlength>
                <D:creationdate>${new Date(item.createDate).toGMTString()}</D:creationdate>
                <D:resourcetype>
                    <D:collection/>
                </D:resourcetype>
                <D:displayname>${item.name}</D:displayname>
            </D:prop>
        </D:propstat>
    </D:response>`
    })
    if (!file.length && !folder.length) {
      file.push(`<D:response>
		<D:href>${this.app.config.myConfig.domain.TheirDomain}/webdavDown?category=${encodeURI(
        share.category
      )}&amp;id=${share.id}&amp;user=${share.user}&amp;size=${item.size}${isFamily}</D:href>
		<D:propstat>
			<D:status>HTTP/1.1 200 OK</D:status>
			<D:prop>
				<D:getcontenttype>${mime.getType(share.fileName)}</D:getcontenttype>
				<D:resourcetype/>
				<D:displayname>${share.fileName}</D:displayname>
			</D:prop>
		</D:propstat>
	</D:response>`)
    }
    return `<?xml version="1.0" encoding="utf-8" ?><D:multistatus xmlns:D="DAV:">${[
      ...file,
      ...folder
    ].join('')}</D:multistatus>`
  }
  async down() {
    let { id, user, category, size } = this.ctx.query,
      res
    if (decodeURI(category) === '家庭云') {
      let { familyId } = this.ctx.query
      res = await this.ctx.service.familyApi.getDownloadUrl(user, familyId, id)
    } else {
      res = await this.ctx.service.listFileApi.getDownloadUrl(user, id)
    }
    return { res, size }
  }
  async list(info, fileId) {
    let res
    res = await this.formatData(await this.getList(info, fileId), info)
    return res
  }
}

module.exports = webdavService
