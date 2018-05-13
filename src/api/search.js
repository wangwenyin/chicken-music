import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'

export function getHotKey() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'
  
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    needNewCode: 1
  })
  
  return jsonp(url, data, options)
}

/*
* @params:
* query 查询的关键字
* page 第一次默认请求第一页
* zhida 当查询歌手时，是否添加歌手对象
* perpage 每页展示的数量
* */
export function search(query, page, zhida, perpage) {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
  
  const data = Object.assign({}, commonParams, {
    w: query,
    p: page,
    perpage,
    n: perpage,
    catZhida: zhida ? 1 : 0,
    zhidaqu: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    perpage: 20,
    n: 20,
    remoteplace: 'txt.mqq.all',
    uin: 0,
    needNewCode: 1,
    platform: 'h5'
  })
  
  return jsonp(url, data, options)
}
