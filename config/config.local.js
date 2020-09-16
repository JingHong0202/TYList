/*
 * @Author: your name
 * @Date: 2020-09-15 09:27:16
 * @LastEditTime: 2020-09-15 22:47:42
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \TYList\config\config.local.js
 */
const domainWhiteList = ['http://127.0.0.1:7001', 'http://localhost:7001', 'http://localhost:8080'],
  secret = 'jinghong'

// config.local.js
module.exports = appInfo => {
  const config = {
    access: {
      domainWhiteList: domainWhiteList
    },
    myConfig: {
      timeout: [15000, 30000],
      domain: {
        TheirDomain: domainWhiteList[0]
      }
    },
    security: {
      csrf: {
        enable: false
      },
      xframe: {
        enable: false
      }
    },
    cors: {
      enable: true,
      package: 'egg-cors',
      origin: domainWhiteList[2],
      allowMethods: 'GET,HEAD,PUT,OPTIONS,POST,DELETE,PATCH',
      credentials: true
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
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: 'xuyuxin',
        database: 'ty'
      },
      app: true
    },
    keys: secret,
    jwt: {
      secret: secret //自定义 token 的加密条件字符串
    }
  }

  // add http_proxy to httpclient
  if (process.env.http_proxy) {
    config.httpclient = {
      request: {
        enableProxy: true,
        rejectUnauthorized: false,
        proxy: process.env.http_proxy
      }
    }
  }

  return config
}
