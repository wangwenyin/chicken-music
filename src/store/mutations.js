import * as types from './mutation-types'

const mutations = {
  // es6命名功能：表达式作为方法名（表达式的结果为字符串）
  [types.SET_SINGER](state, singer) {
    state.singer = singer
  },
  [types.SET_DISS](state, diss) {
    state.diss = diss
  },
  [types.SET_TOP_LIST](state, topList) {
    state.topList = topList
  },
  [types.SET_PLAYING_STATE](state, flag) {
    state.playing = flag
  },
  [types.SET_FULL_SCREEN](state, flag) {
    state.fullScreen = flag
  },
  [types.SET_PLAYLIST](state, list) {
    state.playlist = list
  },
  [types.SET_SEQUENCE_LIST](state, list) {
    state.sequenceList = list
  },
  [types.SET_PLAY_MODE](state, mode) {
    state.mode = mode
  },
  [types.SET_CURRENT_INDEX](state, index) {
    state.currentIndex = index
  },
  [types.SET_SEARCH_HISTORY](state, history) {
    state.searchHistory = history
  }
}

export default mutations
