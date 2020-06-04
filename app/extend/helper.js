'use strict'
const { HmacSHA1 } = require('crypto-js')
module.exports = {
  /**
   * 调用正常情况的返回数据封装
   * @param {Object} ctx - context
   * @param {*} msg  - message
   * @param {*} data - 数据
   */
  success(ctx, msg, data) {
    ctx.body = {
      code: 0,
      msg,
      data
    }
    ctx.status = 200
  },

  /**
   * 处理失败，处理传入的失败原因
   * @param {*} ctx - context
   * @param {Object} res - 返回的状态数据
   */

  fail(ctx, res) {
    ctx.body = {
      code: res.code,
      msg: res.msg,
      data: res.data || ''
    }
    ctx.status = 200
  },

  domainCheck(header, { domainWhiteList }) {
    let { referer } = header
    if (!referer) return false

    return domainWhiteList.filter(item => referer.indexOf(item) !== -1).length
  },
  // RSA(j_rsakey, str) {
  //   let rsaKey = `-----BEGIN PUBLIC KEY-----\n${j_rsakey}\n-----END PUBLIC KEY-----`,
  //     encrypt = crypto.publicEncrypt(rsaKey, Buffer.from(str, 'utf8'))
  //   return Buffer.from(encrypt.toString('base64')).toString('hex')
  // }
  // async getSignatrue(
  //   accessUrl = '/family/manage/getFamilyList.action',
  //   sessionKey = '9a865c09-487d-416a-b31b-aeda9a8458e1_family',
  //   sessionSecret = 'C5E98C60FB65456E20C1D6FA54C2F325',
  //   requestMethod = 'GET',
  //   syncServerDate
  // ) {
  //   let str = `SessionKey=${sessionKey}&Operate=${requestMethod}&RequestURI=${accessUrl}&Date=${new Date().toGMTString()}`
  //   console.log(str)
  //   let t2 = this.hmac(str, sessionSecret)
  //   console.log(t2)
  // }

  async getSignature(accessUrl, sessionKey, sessionSecret, requestMethod, GMT) {
    let str = `SessionKey=${sessionKey}&Operate=${requestMethod}&RequestURI=${accessUrl}&Date=${GMT}`
    return HmacSHA1(str, sessionSecret).toString()
  }
}
