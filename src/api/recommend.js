/**
 * 推荐页面封装的api接口统一放在这里
 */
import jsonp from 'common/js/jsonp' // 默认暴露直接取，不用解构
import axios from 'axios'
import {commonParams,options} from './config' // 只是export暴露的是对象，需解构

// 轮播数据
export function getRecommend() {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  
  // Object.assign() 方法用于将所有可枚举属性的值从一个或多个源对象复制到目标对象。它将返回目标对象。Object.assign(target, ...sources)
  const data = Object.assign({},commonParams,{
    platform: 'h5',
    uin: 0,
    needNewCode:1 // 一些不知道具体含义的，就照其请求参数写
  })
  
  // 返回的是一个promise
  return jsonp(url,data,options)
}

// 歌单(qq音乐有referer限制，需通过node.js层获取)
export function getDissList() {
  const url = '/api/getDissList'
  
  const data = Object.assign({},commonParams,{
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    categoryId: 10000000,
    sortId: 5,
    sin: 0,
    ein: 29,
    rnd: Math.random(),
    format: 'json'
  })
  
  return axios.get(url, {
    params: data
  }).then(res => {
    // res.data才是返回的response
    return Promise.resolve(res.data)
  })
}

export function getSongList(disstid) {
  const url = '/api/getCdInfo'
  
  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0
  })
  
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
