<template>
  <div @click="progressClick" class="progress-bar" ref="progressBar">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend.prevent="progressTouchEnd"
      >
        <div class="progress-btn" ref="progressBtn"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import { prefixStyle } from 'common/js/dom'
  
  const transform = prefixStyle('transform')
  const progressBtnWidth = 16
  export default{
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    data () {
      return {}
    },
    created() {
      this.barWidth = 0
      this.touch = {}
    },
    methods: {
      progressTouchStart(e) {
        // 拖动的标识
        this.touch.initiated = true
        this.touch.startX = e.touches[0].pageX
        this.touch.left = this.$refs.progress.clientWidth
      },
      progressTouchMove(e) {
        if(!this.touch.initiated) {
          return
        }
        let deltaX = e.touches[0].pageX - this.touch.startX
        // 考虑边界值
        let offsetWidth = Math.min(this.barWidth, Math.max(0, deltaX + this.touch.left))
        this._offset(offsetWidth)
      },
      progressTouchEnd() {
        this.touch.initiated = false
        this._triggerPercent()
      },
      progressClick(e) {
        // Element.getBoundingClientRect()方法返回元素的大小及其相对于视口的位置的一个对象,除了 width 和 height 外的属性都是相对于视口的左上角位置而言的
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        // 当点击 progressBtn的时候，offsetX获取不对
        // this._offset(e.offsetX)
         this._offset(offsetWidth)
        this._triggerPercent()
      },
      // 触发percent改变
      _triggerPercent() {
        let percent = this.$refs.progress.clientWidth / this.barWidth
        this.$emit('percentChange', percent)
      },
      // 重复的代码用函数封装
      _offset(offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      }
    },
    watch: {
      percent(newPercent) {
        if(newPercent >= 0 && !this.touch.initiated) {
          this.barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          let offsetWidth = newPercent * this.barWidth
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  
  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
