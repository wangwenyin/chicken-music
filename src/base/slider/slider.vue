<!--这里面放的基础组件（如轮播图），components里是业务组件-->
<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <!--slider组件标签里的div会渲染到插槽slot-->
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" :class="{active: currentPageIndex === index}" v-for="(item,index) in dots"></span>
    </div>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'
  import {addClass} from 'common/js/dom'
  
  export default{
    components: {},
    // 可以自定义props
    props: {
      loop: {
        type: Boolean,
        default: true
      },
      autoPlay: {
        type: Boolean,
        default: true
      },
      interval: {
        type: Number,
        default: 4000
      }
    },
    data () {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    mounted(){
      setTimeout(() => {
        this._setSliderWidth()
        this._initSlider()
        this._initDots()
        
        if(this.autoPlay) {
          this._play()
        }
        
        // 防止窗口重置，sliderWidth没变
        window.addEventListener('resize',() => {
          if(this.slider) {
            this._setSliderWidth(true)
            // width改变，需更新slider
            this.slider.refresh()
          }
        })
      }, 20)
    },
    methods: {
      _setSliderWidth(isResize) {
        // 就是在实例上添加属性
        this.children = this.$refs.sliderGroup.children
        
        let width = 0
        let sliderWidth = this.$refs.slider.clientWidth
  
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child,'slider-item')
          
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        // 窗口改变后，width不再加了（所以需要isResize标识）
        if (this.loop && !isResize) {
          width += 2*sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      _initSlider() {
        this.slider = new BScroll(this.$refs.slider,{
          scrollX: true,
          scrollY: false,
          momentum: false, // 惯性
          snap: { // 这个配置是为了做 Slide 组件用的
            loop: this.loop,
            threshold: 0.3, // 可滚动到下一个的阈值
            speed: 400 // 过渡时间
          },
          click: true
        })
        
        this.slider.on('scrollEnd',() => {
          let pageIndex = this.slider.getCurrentPage().pageX
          // 老版本写法,新版去掉:
          // if (this.loop) {
          //   pageIndex -= 1
          // }
          this.currentPageIndex = pageIndex
          
          // 在scrollEnd清除上一个定时器，重新执行_play，不然pageIndex不会变
          if(this.autoPlay) {
            clearInterval(this.timer)
            this._play()
          }
        })
      },
      _initDots() {
        this.dots = new Array(this.children.length-2)
      },
      _play() {
        let pageIndex = this.currentPageIndex + 1
        if(pageIndex === this.dots.length) {
          pageIndex = 0
        }
        
        this.timer = setInterval(() => {
          this.slider.goToPage(pageIndex,0,400)
        },this.interval)
      }
    },
    destroyed() {
      // 有定时器，需在此生命周期清除，避免不必要的内存泄漏
      clearInterval(this.timer)
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
