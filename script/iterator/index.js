
function asyncFunc() {
  return new Promise(resolve => {
      setTimeout(() => {
          resolve('asyncFunc')
          console.log('async 4000');
      }, 4000)
  })
}
function asyncFunc2() {
  return new Promise(resolve => {
      setTimeout(() => {
          resolve('asyncFunc2')
          console.log('async 5000');
      }, 5000)
  })
}
const pipeLine = [this.asyncFunc, this.asyncFunc2]
setIterator(pipeLine)
// next() - function* + yield - 生成器
function* setGenerator(pipeLine) {
    for(const fn of pipeLine) {
        yield fn()
    }
}
// 配置迭代器 - main
function setIterator(pipeLine) {
    const generator = setGenerator(pipeLine)

    GFC(generator)
}
// 流水线 - 区分异步同步，依次执行
function GFC(gen) {
    const item = gen.next()
    if (item.done) {
        return item.value
    }

    const { value, done } = item
    if (value instanceof Promise) {
        value.then(e => GFC(gen))
    }
    else {
        GFC(gen)
    }
}