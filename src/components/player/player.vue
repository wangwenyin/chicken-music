<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum === index}"
                   v-for="(line,index) in currentLyric.lines"
                >{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="iconMode" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper">
            <img :class="cdCls" width="40" height="40" :src="currentSong.image">
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i :class="miniIcon" class="icon-mini" @click.stop="togglePlaying"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end" :src="currentSong.url" ref="audio"></audio>
  </div>
</template>

<script>
  import {mapGetters, mapMutations} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from 'common/js/dom'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import { playMode } from 'common/js/config'
  import { shuffle } from 'common/js/util'
  import Lyric from 'lyric-parser'
  import Scroll from 'base/scroll/scroll'
  
  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')
  
  export default{
    computed: {
      ...mapGetters([
        'fullScreen',
        'playlist',
        'sequenceList',
        'currentSong',
        'playing',
        'currentIndex',
        'mode'
      ]),
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      cdCls() {
        // 旋转暂停需带上play样式，指明暂停此动画（不然会回到起始位）
        return this.playing ? 'play' : 'play pause'
      },
      disableCls() {
        return this.songReady ? '' : 'disable'
      },
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      iconMode() {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll
    },
    data () {
      return {
        // 定义audio的canplay事件的标识
        songReady: false,
        currentTime: 0,
        radius: 32,
        currentLyric: null,
        currentLineNum: 0,
        currentShow: 'cd'
      }
    },
    created() {
      this.touch = {}
    },
    methods: {
      // 在vue提供的javaScript钩子里用create-keyframe-animation实现js动画
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale()
        let animation = {
          0: {
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0, 0, 0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0, 0, 0) scale(1)`
          }
        }
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        // 不需要animation，transition就能完成
        this.$refs.cdWrapper.style.transition = 'all .4s'
        let {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      _getPosAndScale() {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingBottom - paddingTop - width / 2
        return {
          x,
          y,
          scale
        }
      },
      back() {
        this.setFullScreen(false)
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayMode: 'SET_PLAY_MODE',
        setPlayList: 'SET_PLAYLIST'
      }),
      open() {
        this.setFullScreen(true)
      },
      togglePlaying() {
        if(!this.songReady) {
          return
        }
        this.setPlayingState(!this.playing)
        if(this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      prev() {
        // 防止快速切换的异常
        if(!this.songReady) {
          return
        }
        if(this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex - 1
          if(index === -1) {
            index = this.playlist.length - 1
          }
          this.setCurrentIndex(index)
          if(!this.playing) {
            this.togglePlaying()
          }
        }
  
        this.songReady = false
      },
      end() {
        if(this.mode === playMode.loop) {
          this.loop()
          if(this.currentLyric) {
            this.currentLyric.seek(0)
          }
        } else {
          this.next()
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
      },
      next() {
        if(!this.songReady) {
          return
        }
        // 考虑playList只有一首歌的情况
        if(this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex + 1
          if(index === this.playlist.length) {
            index = 0
          }
          this.setCurrentIndex(index)
          if(!this.playing) {
            this.togglePlaying()
          }
        }
  
        this.songReady = false
      },
      ready() {
        // 当歌曲加载成功
        this.songReady = true
      },
      error() {
        // 失败
        this.songReady = true
      },
      updateTime(e) {
        this.currentTime = e.target.currentTime
      },
      // 格式化currentTime
      format(interval) {
        interval = interval | 0 // 向下取整
        let minute = interval/60 | 0
        let second = this._pad(interval%60)
        return `${minute}:${second}`
      },
      // second-补零
      _pad(num, n=2) {
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      onProgressBarChange(percent) {
        let currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime
        if(this.currentLyric) {
          this.currentLyric.seek(currentTime*1000)
        }
        if(!this.playing) {
          this.togglePlaying()
        }
      },
      changeMode() {
        let mode = (this.mode + 1) % 3
        // 用了vuex，就不能直接改变计算属性mode，必须通过提交一个mutation来改变state，从而间接改变getters
        this.setPlayMode(mode)
        // 随机播放--打乱playlist
        let list = null
        if(mode === playMode.random) {
          list = shuffle(this.sequenceList)
        } else {
          list = this.sequenceList
        }
        this.resetCurrentIndex(list)
        this.setPlayList(list)
      },
      // 切到随机模式--不改变currentSong
      // currentSong是由playlist和currentIndex计算而来
      resetCurrentIndex(list) {
        let index = list.findIndex(item => {
          return item.id === this.currentSong.id
        })
        this.setCurrentIndex(index)
      },
      getLyric() {
        this.currentSong.getLyric().then(lyric => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if(this.playing) {
            this.currentLyric.play()
          }
        })
      },
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum
        if(lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
      },
      middleTouchStart(e) {
        this.touch.initiated = true
        let touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchMove(e) {
        if(!this.touch.initiated) {
          return
        }
        let touch = e.touches[0]
        let deltaX = touch.pageX - this.touch.startX
        let deltaY = touch.pageY - this.touch.startY
        // 仅横向滚动
        if(Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        // 分左滑 右滑
        let left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        let offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
      },
      middleTouchEnd() {
        let offsetWidth,opacity
        if(this.currentShow === 'cd') {
          if(this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          if(this.touch.percent < 0.9) {
            offsetWidth = 0
            opacity = 1
            this.currentShow = 'cd'
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 0.5
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}s`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}s`
      }
    },
    watch: {
      currentSong(newSong, oldSong) {
        if (newSong.id === oldSong.id) {
          return
        }
        // 解决切换歌曲导致歌词跳动(清除上一首歌词实例里的计时器)
        if(this.currentLyric) {
          this.currentLyric.stop()
        }
        /*this.$nextTick(() => {
          this.$refs.audio.play()
          this.getLyric()
        })*/
        // 解决在微信后台播放的bug
        setTimeout(() => {
          this.$refs.audio.play()
          this.getLyric()
        })
      },
      playing(newPlaying) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  
  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            box-sizing: border-box
            height: 100%
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                box-sizing: border-box
                border-radius: 50%
                border: 10px solid rgba(255, 255, 255, 0.1)
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
            .pure-music
              padding-top: 50%
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px
        .imgWrapper
          height: 100%
          width: 100%
          img
            border-radius: 50%
            &.play
              animation: rotate 10s linear infinite
            &.pause
              animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0
  
  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
