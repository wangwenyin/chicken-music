/**
 * 简单的dom操作封装，便于其它地方复用
 */
export function hasClass(el,className){
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

export function addClass(el,className){
  if(hasClass(el,className)){
    return
  }
  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

export function getData(el,name,val) {
  const prefix = 'data-'
  name = prefix + name
  if(val) { // 如果传三个参数
    return el.setAttribute(name,val)
  }
  return el.getAttribute(name)
}

// js操作dom--加浏览器厂商前缀方法封装
/*css的transform我们不用加：是因为vue-loader的auto-prefix插件帮我们加了*/
let elementStyle = document.createElement('div').style

let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform',
  }
  
  for (let key in transformNames) {
    if(elementStyle[transformNames[key]] !== undefined) {
      return key
    }
    
    return false
  }
})()

export function prefixStyle(style) {
  if(vendor === false) {
    return false
  }
  if(vendor === 'standard') {
    return style
  }
  
  return vendor + style.charAt(0).toUpperCase() + style.substring(1)
}

