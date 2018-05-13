<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
  // 抽象一个scroll组件，以备复用
  import BScroll from 'better-scroll'
  
  export default{
    // props:可以自定义，可以从父组件接收，也可以第三方插件有的--最终都成为vue组件实例的属性
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: []
      },
      // 是否监听scroll事件
      listenScroll: {
        type: Boolean,
        default: false
      },
      // 是否下拉加载
      pullup: {
        type: Boolean,
        default: false
      },
      beforeScroll: {
        type: Boolean,
        default: false
      }
    },
    mounted() {
      setTimeout(() => {
        this._initScroll()
      },20)
    },
    methods: {
      _initScroll() {
        // 网速特别慢的话，有这种情况
        if (!this.$refs.wrapper) {
          return
        }
        
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        })
        
        // 派发 scroll 事件,取决于选项中的 probeType
        if(this.listenScroll) {
          this.scroll.on('scroll', pos => {
            this.$emit('scroll',pos)
          })
        }
        
        if(this.pullup) {
          this.scroll.on('scrollEnd', () => {
            // y和maxScrollY都为负值，且底部往上拉有50的空白
            if(this.scroll.y <= this.scroll.maxScrollY + 50) {
              this.$emit('scrollToEnd')
            }
          })
        }
        
        // 在scroll组件滚动之前,派发一个事件以触发搜索框失去焦点（关闭手机端的软键盘）
        if(this.beforeScroll) {
          this.scroll.on('beforeScrollStart', () => {
            this.$emit('beforeScroll')
          })
        }
      },
      refresh() {
        this.scroll && this.scroll.refresh()
      },
      disable() {
        this.scroll && this.scroll.disable()
      },
      enable() {
        this.scroll && this.scroll.enable()
      },
      scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this.refresh()
        },20)
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">

</style>
