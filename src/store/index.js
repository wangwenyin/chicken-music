import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import mutations from './mutations'
// 模块的整体加载到actions对象，不然要用解构赋值一个个加载
import * as actions from './actions'
import * as getters from './getters'
// 控制台打印数据的变化
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

// vuex提供的开发环境代码调试配置
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})



