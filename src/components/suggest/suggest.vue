<template>
  <scroll class="suggest"
          :data="result"
          :pullup="pullup"
          :beforeScroll="beforeScroll"
          @scrollToEnd="searchMore"
          @beforeScroll="listScroll"
          ref="suggest"
  >
    <ul class="suggest-list">
      <li class="suggest-item" v-for="item in result" @click="selectItem(item)">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div class="no-result-wrapper">
      <no-result title="抱歉,暂无搜索结果" v-show="!hasMore && !result.length"></no-result>
    </div>
  </scroll>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import NoResult from 'base/no-result/no-result'
  import { search } from 'api/search'
  import { ERR_OK } from 'api/config'
  import { createSong } from 'common/js/song'
  import Singer from 'common/js/singer'
  import { mapMutations, mapActions } from 'vuex'
  
  // 标识查询歌手的item
  const TYPE_SINGER = 'singer'
  const perpage = 20
  
  export default{
    components: {
      Scroll, Loading, NoResult
    },
    props: {
      query: {
        type: String,
        default: ''
      },
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        page: 1,
        result: [],
        pullup: true,
        // 下拉加载的标识
        hasMore: true,
        beforeScroll: true
      }
    },
    methods: {
      search() {
        // 当搜索中改变query后需重置
        this.page = 1
        this.hasMore = true
        this.$refs.suggest.scrollTo(0,0)
        search(this.query, this.page, this.showSinger, perpage).then(res => {
          if(res.code === ERR_OK) {
            this.result = this._genResult(res.data)
            this._checkMore(res.data)
          }
        })
      },
      // 滚动到底部加载更多
      searchMore() {
        if(!this.hasMore) {
          return
        }
        this.page++
        // page是请求第几页，需把前面的加起来
        search(this.query, this.page, this.showSinger, perpage).then(res => {
          if(res.code === ERR_OK) {
            this.result = this.result.concat(this._genResult(res.data))
            this._checkMore(res.data)
          }
        })
        
      },
      _checkMore(data) {
        let song = data.song
        // 判断是否全部加载完了
        if(!song.list.length || (song.curnum + song.curpage*perpage) >= song.totalnum) {
          this.hasMore = false
        }
      },
      _genResult(data) {
        let ret = []
        if(data.zhida && data.zhida.singerid) {
          // 也可这样拆包
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        if(data.song) {
          ret = ret.concat(this._normalizeSongs(data.song.list))
        }
        return ret
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach(musicData => {
          if(musicData.songid && musicData.albumid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      },
      getIconCls(item) {
        if(item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      getDisplayName(item) {
        if(item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      selectItem(item) {
        if(item.type === TYPE_SINGER) {
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          })
          this.$router.push({
            path: `/search/${singer.id}`
          })
          this.setSinger(singer)
        } else {
          this.insertSong(item)
        }
        // 派发保存searchHistory的事件
        this.$emit('select', item)
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ]),
      // 两层触发事件到search-box,让其blur(手机端)
      listScroll() {
        this.$emit('listScroll')
      },
      // scroll组件是suggest的子组件,suggest需先代理,父组件search才能调用
      refresh() {
        this.$refs.suggest.refresh()
      }
    },
    watch: {
      query() {
        this.search()
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  
  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        /*css3属性选择器：以icon-开头的每个元素*/
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
