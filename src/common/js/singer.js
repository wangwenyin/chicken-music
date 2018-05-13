/**
 * 由于_normalizeSinger函数里avatar代码有重复，
 * 所以我们可以抽象出一个Singer类(即Singer对象)
 * 另外，ES6 的类，完全可以看作构造函数的另一种写法。
 */
export default class Singer {
  constructor({name, id}) {
    this.name = name
    this.id = id
    this.avatar = `https://y.gtimg.cn/music/photo_new/T001R150x150M000${id}.jpg?max_age=2592000`
  }
}
