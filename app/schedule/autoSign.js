const parser = require('fast-xml-parser')
module.exports = {
  schedule: {
    type: 'worker',
    immediate: true,
    cron: '0 30 0 1/1 * ? *',
    cronOptions: {
      tz: 'Asia/Shanghai'
    }
  },
  async task(ctx) {
    let users = await ctx.app.mysql.select('ty_user')
    if (!users) return
    users.forEach(async (item, index) => {
      let { sessionKey, sessionSecret } = item,
        GMT = new Date().toGMTString()
      Signature = await ctx.helper.getSignature(
        '/mkt/userSign.action',
        sessionKey,
        sessionSecret,
        'GET',
        GMT
      )
      let start_Sign = await ctx.curl(
        'https://api.cloud.189.cn/mkt/userSign.action?rand=1591182586666&clientType=TELEANDROID&version=8.6.2',
        {
          headers: {
            SessionKey: sessionKey,
            Signature: Signature,
            Date: GMT
          },
          dataType: 'text'
        }
      )
      let resultTip
      if (start_Sign.res.status === 200) {
        let { data } = start_Sign.res
        let { userSignResult } = parser.parse(data, {
          parseTrueNumberOnly: true
        })
        resultTip = userSignResult.resultTip
      } else {
        resultTip = `${item.uid}账号首次签到失败`
      }
      let num = 2,
        lottery = ''
      while ((num -= 1) != -1) {
        let res = await ctx.curl(
          num == 1
            ? 'https://m.cloud.189.cn/v2/drawPrizeMarketDetails.action?taskId=TASK_SIGNIN&activityId=ACT_SIGNIN&noCache=0.33558145487719315'
            : 'https://m.cloud.189.cn/v2/drawPrizeMarketDetails.action?taskId=TASK_SIGNIN_PHOTOS&activityId=ACT_SIGNIN&noCache=0.5322540734566603',
          {
            headers: {
              cookie: item.cookie,
              Referer: 'https://m.cloud.189.cn/zhuanti/2016/sign/index.jsp?albumBackupOpened=0',
              'X-Requested-With': 'XMLHttpRequest'
            },
            dataType: 'json'
          }
        )
        if (res.data.errorCode) {
          lottery += `用户${item.uid}第${num + 1}次抽奖失败--${res.data.errorMsg}\n`
        } else {
          lottery += `用户${item.uid}第${num + 1}次抽奖成功--${res.data.description}\n`
        }
      }
      ctx.getLogger('autoLogger').info(`用户${item.uid}首次签到${resultTip}\n${lottery}`)
    })
  }
}
