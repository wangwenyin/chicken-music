/**
 * 可以在组件里写,但要学会模块化开发的方式,便于复用与维护
 */
import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LENGTH = 15

// 定义如果重复就把旧的删除(旧的在第一个return),如果数组长度大于15,则最末尾的删除
function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  if(index === 0) {
    return
  }
  if(index > 0) {
    arr.splice(index, 1)
  }
  arr.unshift(val)
  if(maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

// 将搜索历史保存在localStorage
export function saveSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  
  insertArray(searches, query, item => {
    return item === query
  }, SEARCH_MAX_LENGTH)
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 让state里searchHistory与storage里同步
export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  if(index > -1) {
    arr.splice(index, 1)
  }
}
// 定义从searchHistory里删除的方法
export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  
  deleteFromArray(searches, item => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}
// 清空
export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}
