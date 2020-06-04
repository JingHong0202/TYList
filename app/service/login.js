const Service = require('egg').Service
var { AES, enc } = require('crypto-js')

class loginApiService extends Service {
  async login(username, password) {
    let {
        cookie,
        returnUrl,
        lt,
        paramId,
        captchaToekn,
        ck,
        main,
        referer
      } = await this.login_load(),
      {
        sk_cookie,
        sk_returnUrl,
        sk_lt,
        sk_paramId,
        sk_captchaToekn,
        sk_reqId
      } = await this.session_load()

    if (this.ctx.query.sercret) {
      let decrypt = AES.decrypt(password, this.app.config.keys)
      password = decrypt.toString(enc.Utf8)
    }

    let getLoginInfo = await this.ctx.curl(
      'https://open.e.189.cn/api/logbox/oauth2/loginSubmit.do',
      {
        method: 'POST',
        dataType: 'json',
        dataAsQueryString: true,
        data: {
          appKey: 'cloud',
          accountType: '01',
          userName: username,
          password: encodeURI(password),
          validateCode: '',
          captchaToekn: captchaToekn,
          returnUrl: encodeURI(returnUrl),
          mailSuffix: '%40189.cn&dynamicCheck=FALSE&clientType=10010',
          cb_SaveName: '0',
          isOauth2: false,
          state: '',
          paramId: paramId
        },
        headers: {
          cookie: cookie,
          lt: lt,
          referer: main,
          'user-agent':
            'User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36'
        },
        timeout: this.app.config.myConfig.timeout
      }
    )

    let getSessionInfo = await this.ctx.curl(
      'https://open.e.189.cn/api/logbox/oauth2/loginSubmit.do',
      {
        method: 'POST',
        dataType: 'json',
        data: {
          appKey: '8025431004',
          accountType: '02',
          userName: username,
          password: encodeURI(password),
          validateCode: '',
          captchaToekn: sk_captchaToekn,
          returnUrl: sk_returnUrl,
          mailSuffix: '@189.cn',
          cb_SaveName: 1,
          isOauth2: false,
          state: '',
          dynamicCheck: 'FALSE',
          clientType: 10020,
          paramId: sk_paramId
        },
        headers: {
          cookie: sk_cookie,
          lt: sk_lt,
          REQID: sk_reqId,
          'X-Requested-With': 'XMLHttpRequest',
          Referer: 'https://open.e.189.cn/api/logbox/oauth2/unifyAccountLogin.do',
          'user-agent':
            'User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36'
        },
        timeout: this.app.config.myConfig.timeout
      }
    )
    let getSessionForPC = await this.ctx.curl('https://api.cloud.189.cn/getSessionForPC.action', {
      headers: {
        'user-agent':
          'User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36',
        Accept: 'application/json;charset=UTF-8'
      },
      method: 'POST',
      data: {
        clientType: 'TELEMAC',
        version: '1.0.0',
        channelId: 'web_cloud.189.cn',
        redirectURL: getSessionInfo.data.toUrl
      },
      dataType: 'json'
    })
    if (!getSessionInfo.data.toUrl) {
      throw new Error(getSessionInfo.data.msg || '获取session失败')
    }
    let sessionKey_family = getSessionForPC.res.data.familySessionKey,
      accessToken = getSessionForPC.res.data.accessToken,
      sessionKey = getSessionForPC.res.data.sessionKey,
      sessionSecret = getSessionForPC.res.data.sessionSecret

    if (!getLoginInfo.data.toUrl) {
      throw new Error(getLoginInfo.data.msg || '登录失败')
    }

    let toUrl = getLoginInfo.data.toUrl,
      info = await this.ctx.curl(toUrl, {
        headers: {
          referer: referer,
          cookie: `${getLoginInfo.res.headers['set-cookie']};${main}`,
          'user-agent':
            'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36'
        },
        timeout: this.app.config.myConfig.timeout
      })
    cookie = `${ck};${info.res.headers['set-cookie']};${main}`
    if (getLoginInfo.data.msg === '登录成功') {
      let res = (await this.getList(cookie)).res.data,
        usedSize = res['usedSize'],
        quota = res['quota']

      let result = await this.app.mysql.get('ty_user', { uid: username })
      password = AES.encrypt(password, this.app.config.keys).toString()
      if (result) {
        await this.app.mysql.update('ty_user', {
          id: result.id,
          cookie: cookie,
          pass: password,
          total: quota,
          size: usedSize,
          sessionKey,
          sessionSecret,
          accessToken,
          sessionKey_family
        })
      } else {
        await this.app.mysql.insert('ty_user', {
          uid: username,
          cookie: cookie,
          pass: password,
          total: quota,
          size: usedSize,
          sessionKey,
          sessionSecret,
          accessToken,
          sessionKey_family
        })
      }

      return {
        code: 200,
        msg: '成功！'
      }
    } else {
      return {
        code: 500,
        msg: '失败'
      }
    }
  }
  async session_load() {
    let res_html = await this.getHtml(
        'https://cloud.189.cn/unifyLoginForPC.action?appId=8025431004&clientType=10020&returnURL=https://m.cloud.189.cn/zhuanti/2020/loginErrorPc/index.html&timeStamp=333'
      ),
      res_html2 = await this.getHtml(res_html.res.headers.location)
    let { cookie, returnUrl, lt, paramId, captchaToekn, req_id } = await this.getSessionInfo(
      res_html2
    )
    return {
      sk_cookie: cookie,
      sk_returnUrl: returnUrl,
      sk_lt: lt,
      sk_paramId: paramId,
      sk_captchaToekn: captchaToekn,
      sk_reqId: req_id
    }
  }
  async login_load() {
    let res_html = await this.getHtml('https://cloud.189.cn/main.action'),
      main = res_html.res.headers['set-cookie'][0].split(';')[0],
      res_html2 = await this.getHtml(
        'https://cloud.189.cn/udb/udb_login.jsp?pageId=1&redirectURL=/main.action'
      ),
      str = res_html2.res.headers.location,
      referer = str,
      res_html3 = await this.getHtml(str)

    let { cookie, returnUrl, lt, paramId, captchaToekn } = await this.getLoginInfo(res_html3)
    let ck = await this.ctx.curl(
      'https://ux.21cn.com/api/htmlReportRest/getJs.js?pid=25577E0DEEDF48ADBD4459911F5825E4',
      {
        timeout: this.app.config.myConfig.timeout
      }
    )
    ck = ck.res.headers['set-cookie'].join(';')

    return { cookie, returnUrl, lt, paramId, captchaToekn, ck, main, referer }
  }
  async getHtml(url) {
    return await this.ctx.curl(url, {
      dataType: 'text',
      timeout: this.app.config.myConfig.timeout
    })
  }
  async getSessionInfo(arg) {
    let res_data = `${arg.res.data}`,
      cookie = arg.res.headers['set-cookie'],
      returnUrl = res_data.match(/returnUrl = \'(([\s\S]+?))\'/)[2],
      lt = res_data.match(/lt = "(([\s\S]+?))"/)[2],
      paramId = res_data.match(/paramId = "(([\s\S]+?))"/)[2],
      captchaToekn = res_data.match(/name=\'captchaToken\' value=\'(([\s\S]+?))\'/)[2],
      // j_rsakey = res_data.match(/id=\"j_rsaKey\" value=\"(([\s\S]+?))\"/)[2]
      req_id = res_data.match(/reqId = "(([\s\S]+?))"/)[2]
    return { cookie, returnUrl, lt, paramId, captchaToekn, req_id }
  }
  async getLoginInfo(arg) {
    let res_data = `${arg.res.data}`,
      cookie = arg.res.headers['set-cookie'],
      returnUrl = res_data.match(/returnUrl = \'(([\s\S]+?))\'/)[2],
      lt = res_data.match(/lt = "(([\s\S]+?))"/)[2],
      paramId = res_data.match(/paramId = "(([\s\S]+?))"/)[2],
      captchaToekn = res_data.match(/name=\'captchaToken\' value=\'(([\s\S]+?))\'/)[2]
    return { cookie, returnUrl, lt, paramId, captchaToekn }
  }

  async getList(cookie) {
    return await this.ctx.curl(
      `https://cloud.189.cn/v2/getLoginedInfos.action?showPC=true&noCache=${Math.random()}`,
      {
        headers: {
          cookie: cookie,
          referer: 'https://cloud.189.cn/main.action',
          'user-agent':
            'User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36'
        },
        dataType: 'json',
        timeout: this.app.config.myConfig.timeout
      }
    )
  }
}

module.exports = loginApiService
