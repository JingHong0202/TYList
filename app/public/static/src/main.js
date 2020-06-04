import Vue from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import ECharts from 'vue-echarts'
import VueRouter from './router'
import config from '@/assets/config'
Vue.prototype.$config = config
Vue.use(Antd)
Vue.component('v-chart', ECharts)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router: VueRouter
}).$mount('#app')
