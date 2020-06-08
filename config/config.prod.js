const domainWhiteList = ['http://192.168.61.128:7001'],
  secret = 'jinghong'

modules.exports = appInfo => {
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
    static: {
      // 静态化访问前缀,如：`http://127.0.0.1:7001/static/images/logo.png`
      prefix: '/',
      dir: [
        path.join(appInfo.baseDir, 'app/public'),
        path.join(appInfo.baseDir, 'app/public/dist')
      ], // `String` or `Array:[dir1, dir2, ...]` 静态化目录,可以设置多个静态化目录
      dynamic: true, // 如果当前访问的静态资源没有缓存，则缓存静态文件，和`preload`配合使用；
      preload: true,
      maxAge: 86400, // in prod env, 0 in other envs
      buffer: true // in prod env, false in other envs
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
