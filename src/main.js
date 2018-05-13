// 让我们能够使用es6的api（如promise），最先引入
// babel-runtime是辅助es6的编译，不用写在源码中
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import store from './store'
// 解决移动端点击事件300ms延迟的插件
import fastclick from 'fastclick'
import router from './router'
import VueLazyload from 'vue-lazyload'

// 实现首屏优化
Vue.use(VueLazyload,{
  loading: require('common/image/default.png')
})

// 可以按绝对路径写，是因为在webpack.base.conf.js里reslove里配置了common
import 'common/stylus/index.styl'

fastclick.attach(document.body)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store
})
