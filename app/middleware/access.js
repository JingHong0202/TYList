module.exports = option => {
  return async function (ctx, next) {
    if (
      ctx.request.url === '/auth' ||
      ctx.request.url === '/' ||
      /(\/share\/)|(\/downShare\/)|(\/shareList\/)|(\/familyDownShare\/)|(\/webdav)/i.test(
        ctx.request.url
      )
    )
      return await next()
    let authorization, decode
    if (/(down)|(player)/i.test(ctx.request.url)) {
      let auth = ctx.query
      if (!auth.auth) {
        this.ctx.status = 401
        throw new Error('Unauthorized')
      }
      authorization = auth.auth
    } else {
      if (!ctx.headers.authorization || !ctx.helper.domainCheck(ctx.request.header, option)) {
        this.ctx.status = 401
        throw new Error('Unauthorized')
      }
      authorization = ctx.headers.authorization.replace(/^Bearer\s*/g, '')
    }

    try {
      let reverse = ctx.app.config.jwt.secret.split('').reverse().join('')

      decode = ctx.app.jwt.verify(authorization, reverse)
      if (decode.secret !== ctx.app.config.jwt.secret) {
        this.ctx.status = 401
        throw new Error('Unauthorized')
      }

      await next()
    } catch (error) {
      ctx.body = error
    }
  }
}
