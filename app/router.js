module.exports = app => {
  const { router, controller } = app
  router
    .post('/auth', controller.auth.index)

    .get('/systemInfo', controller.system.index)
    .get('/cleanCache', controller.system.cleanCache)

    .post('/login', controller.api.login)
    .get('/users', controller.api.listUser)
    .get('/userDelete/:id', controller.api.deleteUser)

    .get('/files/:uid', controller.api.listFile)
    .get('/files/:uid/:fileid/:page', controller.api.listFile)
    .get('/photos/:uid/:parentId/:page', controller.api.photos)
    .get('/photos/:uid/:parentId', controller.api.photos)
    .get('/player/:uid/:fileid', controller.api.player)
    .get('/Down/:uid/:fileid', controller.api.Down)
    // .get('/DownAll/:uid/:fileid/:page', controller.api.DownAll)

    //family
    .get('/family/:uid', controller.api.family)
    .get('/family/:uid/:fileId/:page', controller.api.family)
    .get('/familyPlayer/:uid/:familyId/:fileid', controller.api.familyPlayer)
    .get('/familyInfos/:uid', controller.api.familyInfos)
    .get('/familySearch/:familyId/:uid/:wd/:page', controller.api.familySearch)
    .get('/familyDown/:uid/:familyId/:fileid', controller.api.familyDown)
    // .get('/familyDownAll/:uid/:fileid/:page', controller.api.familyDownAll)
    .get('/familyGetFileInfo/:uid/:familyId/:fileid', controller.api.familyGetFileInfo)

    // share
    .post('/addShare', controller.share.add)
    .post('/deleteShare', controller.share.delete)
    .post('/updateShare', controller.share.update)
    .get('/getShareAll', controller.share.all)
    .get('/share/:fileid', controller.share.index)
    .get('/shareList/:fileid', controller.share.list)
    .get('/downShare/:parent/:user/:fileId', controller.share.down)
    .get('/familyDownShare/:parent/:user/:fileId', controller.share.familyDown)
    // default
    .get('/', controller.home.index)
    // webdav
    .propfind(/^\/webdav\/([\w\W-.]+$)/, controller.webdav.index)
    .get('/webdavDown', controller.webdav.down)
  // .propfind('/WebdavList', controller.webdav.list)
}
