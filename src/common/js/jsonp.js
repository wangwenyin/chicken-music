/*
 * 一些封装的通用js方法可以放在common/js文件夹下，很多地方都会用到
 * */
// jsonp插件方法通过promise进一步封装
import originJsonp from 'jsonp'

export default function jsonp(url, data, option) {
  // 有问号就会有查询字符串，直接在后面加&和转化后的字符串
  // 没有问号直接在后面加?和转化后的字符串
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  
  return new Promise((reslove, reject) => {
    originJsonp(url, option, (err, data) => {
      if (!err) {
        reslove(data)
      } else {
        reject(err)
      }
    })
  })
}

// 定义将data拼接到url后面的方法（因为jsonp插件没有data，而我们发送的请求一般都会把查询参数包装成对象形式）
export function param(data) {
  let url = ''
  for (var k in data) {
    let value = data[k] ? data[k] : ''
    url += `&${k}=${encodeURIComponent(value)}`
  }
  // 去掉第一个&
  return url ? url.substring(1) : ''
}


// substring() 方法用于提取字符串中介于两个指定下标之间的字符
