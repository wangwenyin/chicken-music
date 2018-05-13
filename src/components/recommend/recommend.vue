<template>
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="dissList">
      <div>
        <div v-if="recommends.length" class="slider-wrapper">
          <slider>
            <div v-for="item in recommends">
              <a :href="item.linkUrl">
                <img @load="loadImage" :src="item.picUrl">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li class="item" @click="selectItem(item)" v-for="item in dissList">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl">
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!dissList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
  import {getRecommend, getDissList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import Slider from 'base/slider/slider'
  import Scroll from 'base/scroll/scroll'
  // loading组件:1.用户体验友好 2.组件化开发-便于维护和复用
  import Loading from 'base/loading/loading'
  import {playlistMixin} from 'common/js/mixin'
  import {mapMutations} from 'vuex'
  
  export default{
    mixins: [playlistMixin],
    components: {
      Slider, Scroll, Loading
    },
    data () {
      return {
        recommends: [],
        dissList: []
      }
    },
    created(){
      this._getRecommend()
      this._getDissList()
    },
    methods: {
      handlePlaylist(playlist) {
        let bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      selectItem(item) {
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        this.setDiss(item)
      },
      ...mapMutations({
        setDiss: 'SET_DISS'
      }),
      _getRecommend() {
        getRecommend().then(res => {
          if(res.code === ERR_OK) {
            this.recommends = res.data.slider
          }
        })
      },
      _getDissList() {
        getDissList().then(res => {
          if(res.code === ERR_OK) {
            this.dissList = res.data.list
          }
        })
      },
      // 确保即使轮播数据后获取,better-scroll也能正确计算高度
      loadImage() {
        // 标识checkLoaded,只需要refresh一次
        if(!this.checkLoaded) {
          this.$refs.scroll.refresh()
          this.checkLoaded = true
        }
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50% // 让元素垂直居中
        transform: translateY(-50%)
</style>
