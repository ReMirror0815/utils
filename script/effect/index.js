// 简易实现vue3新特性ref、effect
let activeEffect;

// 基于普通对象创建代理对象的方法
function ref(init) {
  class RefImpl {
    constructor(init) {
        this._value = init;
    }
    get value() {
      // 收集依赖
      trackRefValue(this);
      return this._value
    }
    set value(newVal) {
      this._value = newVal;
      // 触发副作用函数
      triggerRefValue(this, )
    }
  }
  return new RefImpl(init)
}

function trackRefValue(refValue) {
  if (!refValue.dep) {
    refValue.dep = new Set();
  }
  refValue.dep.add(activeEffect);
}


function triggerRefValue(refValue) {
  [...refValue.dep].forEach(effect => effect.fn())
}

// 副作用函数
// 源码里面effect还有第二个参数options
function effect(fn) {
  activeEffect = new ReactiveEffect(fn)
  fn();
}

class ReactiveEffect {
  constructor(fn) {
    this.fn  = fn;
  }
}

const refValue = ref(0)

effect(function fn() {
  console.log(refValue.value)
})

refValue.value++
