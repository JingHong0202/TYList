const path = require('path'),
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
      disableConsoleAfterReady: false,
      dir: path.join(appInfo.baseDir, 'logs/ty')
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
    middleware: ['errorHandler', 'access'],
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
    }
  }
}
