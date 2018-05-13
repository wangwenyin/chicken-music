/**
 * 一些请求里data的通用配置定义在这里
 */
export const commonParams = {
  g_tk: 5381,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  format: 'jsonp',
  notice: 0
}

export const options = {
  // param是jsonp请求中与后端约定的回调
  param: 'jsonpCallback'
}

export const ERR_OK = 0
