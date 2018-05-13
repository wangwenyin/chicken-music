<template>
  <div class="song-list">
    <ul>
      <li class="item" v-for="(song,index) in songs" @click="selectItem(song,index)">
        <div class="rank" v-show="rank">
          <span :class="getRankCls(index)">{{getRankText(index)}}</span>
        </div>
        <div class="content">
          <h2 class="name">{{song.name}}</h2>
          <p class="desc">{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  export default{
    props: {
      songs: {
        type: Array,
        default: []
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    components: {},
    data () {
      return {}
    },
    methods: {
      getDesc(song) {
        return `${song.singer}-${song.album}`
      },
      selectItem(item, index) {
        // 基础组件不处理业务逻辑，派发到业务组件music-list处理
        this.$emit('select', item, index)
      },
      getRankCls(index) {
        if(index <= 2) {
          return `icon icon${index}`
        } else {
          return 'text'
        }
      },
      getRankText(index) {
        if(index > 2) {
          return index + 1
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  // scoped 限制作用域：解决组件间样式冲突问题（如rank样式）
  .song-list
    .item
      display: flex
      align-items: center
      box-sizing: border-box
      height: 64px
      font-size: $font-size-medium
      .rank
        flex: 0 0 25px
        width: 25px
        margin-right: 30px
        text-align: center
        .icon
          display: inline-block
          width: 25px
          height: 24px
          background-size: 25px 24px
          &.icon0
            bg-image('first')
          &.icon1
            bg-image('second')
          &.icon2
            bg-image('third')
        .text
          color: $color-theme
          font-size: $font-size-large
      .content
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          no-wrap()
          color: $color-text
        .desc
          no-wrap()
          margin-top: 4px
          color: $color-text-d
</style>
