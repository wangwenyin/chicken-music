/**
 * actions里一般写：
 * 1. 异步请求
 * 2. 多个mutation的封装（避免组件里写多个mutation的提交）
 */
import * as types from './mutation-types'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'
import { saveSearch, deleteSearch, clearSearch } from 'common/js/cache'

function findIndex(list, song) {
  return list.findIndex(item => {
    return item.id === song.id
  })
}
export const selectPlay = ({commit, state}, {list, index}) => {
  commit(types.SET_SEQUENCE_LIST, list)
  // 当随机播放时，点击了歌曲列表，playList仍为randomList
  // 但需播放点击的歌曲（通过找到这首歌对应randomList中的index）
  if(state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const randomPlay = ({commit}, {list}) => {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = ({commit,state}, song) => {
  // 不能在mutation外改变state里的数据(被后面的splice改变了原数组)，但可以拷贝一个副本
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  // 值类型不存在上述问题
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // 查找当前列表中是否有待插入的歌曲并返回其索引
  let fpIndex = findIndex(playlist, song)
  // 因为是插入歌曲 索引+1
  currentIndex++
  playlist.splice(currentIndex, 0, song)
  // 如果已经包含这首歌曲(删除原来的)
  if(fpIndex > -1) {
    // 如果当前序号大于返回的序号
    if(currentIndex > fpIndex) {
      playlist.splice(fpIndex,1)
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1,1)
    }
  }
  
  // 逻辑同上
  // 在sequenceList中要插入的位置
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  let fsIndex = findIndex(sequenceList, song)
  sequenceList.splice(currentSIndex, 0, song)
  if(fsIndex > -1) {
    if(currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
      // currentIndex只是针对playlist
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }
  
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = ({commit}, query) => {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}
// 提交从searchHistory里删除的mutation
export const deleteSearchHistory = ({commit}, query) => {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = ({commit}) => {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

