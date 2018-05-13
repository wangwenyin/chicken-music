<template>
  <scroll class="listview"
          :data="dataList"
          ref="listView"
          :listenScroll="listenScroll"
          @scroll="scroll"
          :probeType="probeType"
  >
    <ul>
      <li class="list-group" v-for="group in dataList" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li class="list-group-item" v-for="item in group.items" @click="selectItem(item)">
            <img v-lazy="item.avatar" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li class="item"
            :class="{'current': currentIndex === index}"
            v-for="(item,index) in shortcutList"
            :data-index="index"
        >
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div class="loading-container" v-show="!dataList.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import {getData} from 'common/js/dom'
  import Loading from 'base/loading/loading'
  // list-shortcut中每个item的高度
  const ANCHOR_HEIGHT = 18
  const TITLE_HEIGHT = 30
  
  export default{
    props: {
      dataList: {
        type: Array,
        default: []
      }
    },
    components: {
      Scroll, Loading
    },
    data() {
      return {
        scrollY: -1, // 滚动的Y坐标(往上为负)--需要监视
        currentIndex: 0, // list-shortcut中需高亮的dom的index
        diff: -1
      }
    },
    computed: {
      shortcutList() {
        return this.dataList.map(group => {
          return group.title.substring(0,1)
        })
      },
      // group的标题固定
      fixedTitle() {
        if(this.scrollY > 0) {
          return ''
        }
        return this.dataList[this.currentIndex] ? this.dataList[this.currentIndex].title : ''
      }
    },
    created() {
      // 由于firstTouch不能被TouchMove函数看到，可在实例里定义一个touch对象
      // 最好不要在data里定义，因为vue会实时监视data数据的变化，这里不需要（因为touchmove的时候是一直在变化的）
      this.touch = {}
      // 这里也可在data里定义
      this.listenScroll = true
      // 哪个业务组件（不是base组件）需要,就在哪里定义
      this.probeType = 3
      this.listTop = []
    },
    methods: {
      // listview是基础组件，最好不处理业务逻辑
      // 点击派发到singer组件(业务组件)跳转到子路由
      selectItem(item) {
        this.$emit('select', item)
      },
      onShortcutTouchStart(e) {
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY
        let anchorIndex = getData(e.target,'index')
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      onShortcutTouchMove(e) {
        let lastTouch = e.touches[0]
        this.touch.y2 = lastTouch.pageY
        // 相当于Math.floor((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT)
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        // anchorIndex类型是string，单独用内部会转换，与delta相加需手动转换
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta
        this._scrollTo(anchorIndex)
      },
      refresh() {
        this.$refs.listView.refresh()
      },
      // 1.相当于子组件向父组件传递数据（只需要子组件$emit触发，不需要父组件$on监听）
      // 2.兄弟组件间用eventBus，需$on监听
      // 3.中大型项目vuex
      scroll(pos) {
        this.scrollY = pos.y
      },
      _scrollTo(index) {
        // 边界判断 index为null
        if(!index && index !== 0) {
          return
        }
        if(index < 0) {
          index = 0
        }else if(index > this.listTop.length - 2) {
          index = this.listTop.length - 2
        }
        // 操作list-shortcut--高亮，需改变scrollY
        this.scrollY = -this.listTop[index]
        this.$refs.listView.scrollToElement(this.$refs.listGroup[index],0)
      },
      // 计算每个group的top值
      _computedTop() {
        let list = this.$refs.listGroup
        let top = 0
        this.listTop.push(top)
        for (let i = 0; i < list.length; i++) {
          top += list[i].clientHeight
          this.listTop.push(top)
        }
      }
    },
    watch: {
      // 监视数据（dataList）的变动,等dom渲染完毕
      dataList() {
         setTimeout(() => {
           this._computedTop()
         }, 20)
      },
      scrollY(newY) {
        let listTop = this.listTop
        // 当滚动到顶部 newY>0
        if(newY > 0) {
          this.currentIndex = 0
          return
        }
        for (let i = 0; i < listTop.length; i++) {
          let top1 = listTop[i]
          let top2 = listTop[i + 1] // top2可能为undefined
          if(!top2 || (-newY >= top1 && -newY < top2)) {
            this.currentIndex = i
            this.diff = top2 + newY
            return
          }
        }
      },
      // 固定title优化--实现顶的动画效果
      diff(newVal) {
        let fixTop = (newVal > 0  && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        // !fixTop
        if(this.fixTop === fixTop) {
          return
        }
        this.fixTop = fixTop
        // translate3d开启GPU硬件加速，提升动画性能
        this.$refs.fixed.style.transform = `translate3d(0,${fixTop}px,0)`
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  
  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
