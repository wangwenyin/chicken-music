/**
 * 混和：插入到组件中的复用功能（类似merge）
 */
import {mapGetters} from 'vuex'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    // 会以组件里handlePlaylist为主
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}
