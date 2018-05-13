function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 洗牌函数
export function shuffle(arr) {
  // 防止改变原数组(创建arr的副本)
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}

// 节流函数(防止快速改变query,都发了请求,浪费流量)
export function debounce(func, delay) {
  let timer
  
  return function (...args) {
    if(timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

