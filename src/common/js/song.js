/**
 * 歌手详情页数据处理--Song类封装
 */
import {Base64} from 'js-base64'
import { getVkey, getLyric } from 'api/song'
import { ERR_OK } from 'api/config'
import { getUid } from './uid'

const urlMap = {}

export default class Song {
  constructor({id, mid, singer, name, album, duration, image}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.filename = `C400${this.mid}.m4a`
    if(urlMap[this.id]) {
      this.url = urlMap[this.id]
    } else {
      this._genUrl()
    }
  }
  
  _genUrl() {
    if (this.url) {
      return
    }
    getVkey(this.mid, this.filename).then(res => {
      if (res.code === ERR_OK) {
        let vkey = res.data.items[0].vkey
        
        this.url = `http://dl.stream.qqmusic.qq.com/${this.filename}?vkey=${vkey}&guid=${getUid()}&uin=0&fromtag=66`
        urlMap[this.id] = this.url
      }
    })
  }
  // 歌词应该作为歌曲的属性
  getLyric() {
    if(this.lyric) {
      return Promise.resolve(this.lyric)
    }
    
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then(res => {
        if(res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject('no lyric')
        }
      })
    })
  }
}


// 对Song类进一层封装
export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
  })
}

// musicData.singer是数组，且有可能多个歌手
function filterSinger(singer) {
  let ret = []
  if(!singer) {
    return ''
  }
  singer.forEach(s => {
    ret.push(s.name)
  })
  return ret.join('/')
}
