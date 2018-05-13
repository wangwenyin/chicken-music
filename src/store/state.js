/*多个组件模块共享的数据放在vuex里
* 1. 歌手详情
* 2. 播放器模块数据
* 3. 搜索历史
* */
import {playMode} from 'common/js/config'
import {loadSearch} from 'common/js/cache'

const state = {
  singer: {},
  diss: {},
  topList: {},
  playing: false,
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  mode: playMode.sequence,
  currentIndex: -1,
  searchHistory: loadSearch()
}

export default state
