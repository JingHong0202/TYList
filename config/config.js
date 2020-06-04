const domainWhiteList = ['http://127.0.0.1:7001'],
  secret = 'jinghong',
  path = require('path'),
  fsStore = require('cache-manager-fs-hash')
module.exports = appInfo => {
  return {
    view: {
      mapping: {
        '.ejs': 'ejs'
      }
    },
    validate: {
      convert: true
    },
    logger: {
      outputJSON: true,
      level: 'DEBUG',
      allowDebugAtProd: true,
      consoleLevel: 'DEBUG',
      disableConsoleAfterReady: false
    },
    logrotator: {},
    customLogger: {
      autoLogger: {
        file: path.join(appInfo.root, 'logs/ty/auto.log')
      },
      scheduleLogger: {
        consoleLevel: true
        // file: path.join(appInfo.root, 'logs', appInfo.name, 'egg-schedule.log'),
      }
    },
    ejs: {},
    keys: secret,
    security: {
      csrf: {
        enable: false
      },
      xframe: {
        enable: true,
        // 'SAMEORIGIN', 'DENY' or 'ALLOW-FROM http://example.jp'
        value: 'SAMEORIGIN'
      }
    },
    access: {
      domainWhiteList: domainWhiteList
    },
    middleware: ['access', 'errorHandler'],
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
    cache: {
      default: 'fsStore',
      stores: {
        fsStore: {
          driver: fsStore,
          options: {
            path: 'cache', //缓存文件的路径
            ttl: 60 * 60, //生存时间（以秒为单位）
            zip: true //压缩文件以节省磁盘空间（默认值：false）
          }
        }
      }
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
    cluster: {
      listen: {
        port: 7001,
        hostname: 'localhost', // 不建议设置 hostname 为 '0.0.0.0'，它将允许来自外部网络和来源的连接，请在知晓风险的情况下使用
        // path: '/var/run/egg.sock',
        'ignore-stderr': true
      }
    },
    jwt: {
      secret: secret //自定义 token 的加密条件字符串
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
    }
  }
}
