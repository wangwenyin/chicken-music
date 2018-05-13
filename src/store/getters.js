/**
 * getter: 有时候我们需要从 store 中的 state 中派生出一些状态
 * 用getter取state里的数据到组件
 */
export const singer = state => state.singer

export const diss = state => state.diss

export const topList = state => state.topList

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const playlist = state => state.playlist

export const sequenceList = state => state.sequenceList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex

export const currentSong = state => {
  return state.playlist[state.currentIndex] || {}
}

export const searchHistory = state => state.searchHistory
