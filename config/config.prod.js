const domainWhiteList = ['http://192.168.61.128:7001'],
  secret = 'jinghong'

module.exports = appInfo => {
  return {
    access: {
      domainWhiteList: domainWhiteList
    },
    myConfig: {
      timeout: [15000, 30000],
      domain: {
        TheirDomain: domainWhiteList[0]
      }
    },
    cors: {
      enable: true,
      package: 'egg-cors',
      origin: domainWhiteList[0],
      allowMethods: 'GET,HEAD,PUT,OPTIONS,POST,DELETE,PATCH',
      credentials: true
    },
    security: {
      csrf: {
        enable: false
      },
      xframe: {
        enable: true,
        // 'SAMEORIGIN', 'DENY' or 'ALLOW-FROM http://example.jp'
        value: 'SAMEORIGIN'
      },
      domainWhiteList
    },
    cluster: {
      listen: {
        port: 7001,
        hostname: '0.0.0.0', // 不建议设置 hostname 为 '0.0.0.0'，它将允许来自外部网络和来源的连接，请在知晓风险的情况下使用
        // path: '/var/run/egg.sock',
        'ignore-stderr': true
      }
    },
    mysql: {
      client: {
        host: 'db',
        port: '3306',
        user: 'ty',
        password: 'yinger2015',
        database: 'ty'
      },
      app: true
    },
    keys: secret,
    jwt: {
      secret: secret //自定义 token 的加密条件字符串
    }
  }
}
