import { commonParams, options } from './config'
import jsonp from 'common/js/jsonp'
import axios from 'axios'
import { getUid } from 'common/js/uid'

// 获取歌曲url里的vkey
export function getVkey(songmid, filename) {
  const url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg'
  
  const data = Object.assign({}, commonParams, {
    cid: 205361747,
    format: 'json',
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    uin: 0,
    songmid,
    filename,
    guid: getUid()
  })
  
  return jsonp(url, data, Object.assign({}, options, {
    param: 'callback'
  }))
}

// 获取歌词（也有referer限制）
export function getLyric(mid) {
  const url = '/api/lyric'
  
  const data = Object.assign({}, commonParams, {
    songmid: mid,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    categoryId: 10000000,
    pcachetime: +new Date(), // 日期对象转换为时间戳
    format: 'json'
  })
  
  return axios.get(url, {
    params: data
  }).then(res => {
    return Promise.resolve(res.data)
  })
}
