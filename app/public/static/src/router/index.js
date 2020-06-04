import Vue from 'vue'
import router from 'vue-router'

Vue.use(router)

const routers = [
  {
    path: '/notFound',
    name: 'notFound',
    component: () => import('@/components/notFound')
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/components/forbidden')
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/components/auth')
  },
  {
    path: '/',
    name: 'index',
    alias: '/index',
    component: () => import('@/components/index')
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('@/components/user')
  },
  {
    path: '/list',
    name: 'list',
    component: () => import('@/components/list')
  },
  {
    path: '/fylist',
    name: 'fylist',
    component: () => import('@/components/fylist')
  },
  {
    path: '/share',
    name: 'share',
    component: () => import('@/components/share')
  },
  { path: '*', redirect: '/notFound' }
]
const VueRouter = new router({
  mode: 'hash',
  routes: routers
})
window.progress = {
  time: null,
  num: 0
}
function startProgress() {
  let progressbg = document.querySelector('.progress .ant-progress-bg'),
    progress = document.querySelector('.progress')
  if (progressbg) {
    window.num = 0
    progressbg.style.width = 0 + '%'
    progress.style.opacity = 1
    window.time = setInterval(() => {
      if (window.num === 95 || window.num === 100) return clearInterval(window.time)
      window.num += 5
      progressbg.style.width = window.num + '%'
    }, 400)
  }
}
VueRouter.beforeEach(async (to, from, next) => {
  let auth = JSON.parse(localStorage.getItem('access'))
  if (auth && auth != undefined && auth != null) {
    startProgress()
    return next()
  }
  if (to.path === '/forbidden' || to.path === '/notFound' || to.path === '/auth') {
    return next()
  }
  if (to.path !== '/auth') {
    return next({ path: '/forbidden' })
  }
})
// VueRouter.beforeResolve((to, from, next) => {
//   console.log(to, from)
//   next('auth')
// })
export default VueRouter
