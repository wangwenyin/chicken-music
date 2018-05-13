<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper" ref="playBtn" @click="random">
        <div class="play" v-show="songs.length">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <!--layer层实现滚动遮罩(原生app的效果)-->
    <div class="bg-layer" ref="layer"></div>
    <scroll :probe-type="probeType" :listen-scroll="listenScroll" @scroll="scroll" class="list" :data="songs" ref="list">
      <div class="song-list-wrapper">
        <song-list :rank="rank" :songs="songs" @select="selectItem"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import {prefixStyle} from 'common/js/dom'
  import Loading from 'base/loading/loading'
  import {mapActions} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'
  
  const RESERVED_HEIGHT = 40
  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('backdrop-filter')
  
  export default{
    mixins: [playlistMixin],
    props: {
      title: {
        type: String,
        default: ''
      },
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    components: {
      Scroll, SongList, Loading
    },
    data () {
      return {
        scrollY: -1
      }
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      }
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
    },
    mounted() {
      this.imageHeight = this.$refs.bgImage.clientHeight
      this.maxTranslateY = -this.imageHeight + RESERVED_HEIGHT
      // this.$refs.list.$el-组件标签对应的dom元素
      this.$refs.list.$el.style.top = this.$refs.bgImage.clientHeight + 'px'
    },
    methods: {
      handlePlaylist(playlist) {
        let bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      back() {
        this.$router.back()
      },
      scroll(pos) {
        this.scrollY = pos.y
      },
      selectItem(item, index) {
        this.selectPlay({
          list: this.songs,
          index
        })
      },
      random() {
        this.randomPlay({
          list: this.songs
        })
      },
      ...mapActions(['selectPlay', 'randomPlay'])
    },
    watch: {
      // 根据scrollY改变layer层的偏移
      scrollY(newY) {
        let translateY = Math.max(this.maxTranslateY, newY)
        let zIndex = 0
        let scale = 1
        let blur = 0
        let percent = Math.abs(newY/this.imageHeight)
        
        if(newY > 0) {
          // 下拉图片放大
          scale = 1 + percent
          zIndex = 10
          this.$refs.bgImage.style[transform] = `scale(${scale})`
        } else {
          // 高速模糊效果（ios才能看到）
          blur = Math.min(percent*20, 20)
          this.$refs.filter.style[backdrop] = `blur(${blur}px)`
        }
        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
        // 让顶部看不到滚动
        if(newY < this.maxTranslateY) {
          zIndex = 10
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          this.$refs.playBtn.style.display = 'none'
        } else {
          // 重置
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = ''
        }
        this.$refs.bgImage.style.zIndex = zIndex
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  
  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70% // 规定基于父元素的宽度的百分比的内边距 宽高比10:7->达到图片宽高自适应的效果
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: absolute
      top: 0 // top值在不同设备上不是固定,可通过计算得到
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
