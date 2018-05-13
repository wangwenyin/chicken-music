<template>
  <div class="singer" ref="singer">
    <listview @select="selectSinger" :dataList="singers" ref="list"></listview>
    <router-view></router-view>
  </div>
</template>

<script>
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import Listview from 'base/listview/listview'
  import {mapMutations} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'
  
  const HOT_NAME = '热门'
  const HOT_SINGER_LEN = 10
  
  export default{
    mixins: [playlistMixin],
    components: {
      Listview
    },
    data () {
      return {
        singers: []
      }
    },
    mounted() {
      this._getSingerList()
    },
    methods: {
      handlePlaylist(playlist) {
        let bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()
      },
      selectSinger(singer) {
        // 编程式的导航 相当于 声明式:<router-link :to="...">
        // {}就是route对象
        // router.replace同push，但它不会向 history 添加新记录
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        
        this.setSinger(singer)
      },
      _getSingerList() {
        getSingerList().then(res => {
          if(res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list)
//            console.log(this._normalizeSinger(this.singers))
          }
        })
      },
      // 有时候从后台获取的数据结构不是我们期望的,需做些处理
      _normalizeSinger(list) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        list.forEach((item, index) => {
          if(index < HOT_SINGER_LEN) {
            map.hot.items.push(new Singer({
              name: item.Fsinger_name,
              id: item.Fsinger_mid,
            }))
          }
  
          const key = item.Findex
          if(!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid,
          }))
        })
  
        // 为了得到有序列表，我们需要处理 map
        let hot = []
        let ret = []
        for (let key in map) {
          let val = map[key]
          if(val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          }else if(val.title === HOT_NAME) {
            hot.push(val)
          }
        }
  
        // 如果指明了 compareFunction ，那么数组会按照调用该函数的返回值排序(a-b->升序)
        ret.sort((a,b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        // 返回值是一表示给定索引处（String中index索引处）字符的 UTF-16 代码单元值的数字(0到65535之间的整数)；如果索引超出范围，则返回 NaN。
        // 只能匹配一个，想要整个代码点的值，使用 codePointAt()。
//        console.log("ABC".charCodeAt(0)) 65
//        console.log("ABC".charCodeAt(1)) 66
        return hot.concat(ret)
      },
      // 1. 对象展开运算符 2. 以对象形式另取一个名字
      // 将被mapMutations映射为 this.$store.commit('SET_SINGER')
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
