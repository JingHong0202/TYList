export default {
  server:
    process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:7001'
      : `http://${window.location.host}`
}
// if ( === 'development') {
//   alert('开发环境')
// } else {
//   alert('生产环境')
// }
