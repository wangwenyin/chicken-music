<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <keep-alive>
      <!--匹配到的路由组件将被缓存，避免重新渲染-->
      <router-view></router-view>
    </keep-alive>
    <!--由于player是全局组件，故放在主组件底部，通过其属性控制其显示隐藏-->
    <player></player>
  </div>
</template>

<script>
  // 用绝对路径的话，同样要在reslove里配置components
  import MHeader from 'components/m-header/m-header'
  import Tab from 'components/tab/tab'
  import Player from 'components/player/player'
  
  export default {
    name: 'App',
    components: {
      MHeader, Tab, Player
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  // variable和mixin是哪个组件需要用，就在哪里引入（不能像index.styl在main.js里引入）
  @import "~common/stylus/variable"
  #app
    color: $color-theme
</style>
