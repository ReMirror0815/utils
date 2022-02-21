// js封装实现promise

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
 
class MPromise {
  FULFILLED_CALLBACK_LIST = [];
  REJECTED_CALLBACK_LIST = [];
  _status = PENDING;
 
  constructor(fn) {
    this.status = PENDING;
    this.value = null;
    this.reason = null;
 
    try{
      fn(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.reject(e)
    }
  }
 
  get status() {
    console.log('get status')
    return this._status
  }
 
  set status(newstatus){
    console.log('newstatus', newstatus)
    this._status = newstatus
    switch(newstatus){
      case FULFILLED:{
        this.FULFILLED_CALLBACK_LIST.forEach(callBack=>{
          callBack(this.value)
        })
        break;
      }
      case REJECTED:{
        this.REJECTED_CALLBACK_LIST.forEach(callBack=>{
          callBack(this.value)
        })
        break;
      }
    }
  }
 
 
  resolve(value){
    if (this.status === PENDING){
      this.status = FULFILLED
      this.value = value
    }
  }
 
  reject(reason){
    if (this.status === PENDING){
      this.status = REJECTED
      this.reason = reason
    }
  }
 
  then(onFulfilled, onRejected){
    const realOnFulfilled = this.isFunction(onFulfilled) ? onFulfilled: value => {
      return value
    }
    const realOnRejected = this.isFunction(onRejected) ? onRejected: value => {
      throw value
    }
 
    const promise2 = new MPromise((resolve,reject)=>{
 
      const fulfilledMicrotask = () => {
        queueMicrotask(() => {
            try {
                const x = realOnFulfilled(this.value);
                this.resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
                reject(e)
            }
        })
      };
      const rejectedMicrotask = () => {
        queueMicrotask(() => {
            try {
                const x = realOnRejected(this.reason);
                this.resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
                reject(e);
            }
        })
      }
      console.log(this.status)
      switch(this.status) {
        case FULFILLED: {
          fulfilledMicrotask();
          break;
        }
        case REJECTED: {
          rejectedMicrotask();
          break;
        }
        case PENDING: {
          this.FULFILLED_CALLBACK_LIST.push(fulfilledMicrotask)
          this.REJECTED_CALLBACK_LIST.push(rejectedMicrotask)
        }
      }
 
    })
    return promise2
  }
 
  resolvePromise(promise2, x, resolve, reject){
    if(promise2===x){
      return reject(new TypeError('The promise and the return value are the same'));
    }
    if(x instanceof MPromise){
      queueMicrotask(() => {
        x.then((y) => {
            this.resolvePromise(promise2, y, resolve, reject);
        }, reject);
      })
    } else if(typeof x === 'object' || this.isFunction(x)){
      if ( x === null) {
        return resolve(x)
      }
      let then = null;
      try{
        then = x.then
      }catch(err){
        return  reject(err)
      }
      if(this.isFunction(then)){
        let called = false;
        try{
          then.call(
            x,
            (y) => {
                if (called) return;
                called = true;
                this.resolvePromise(promise2, y, resolve, reject);
            },
            (r) => {
                if (called) return;
                called = true;
                reject(r);
            });
        }catch(e){
          if(called){
            return
          }
          reject(e)
        }
 
      } else {
        resolve(x)
      }
 
    } else {
      return resolve(x)
    }
  }
 
  catch (onRejected) {
    return this.then(null, onRejected);
  }
 
  isFunction(params){
    return typeof params === 'function'
  }
 
  static resolve(value) {
    if (value instanceof MPromise) {
        return value;
    }
 
    return new MPromise((resolve) => {
        resolve(value);
    });
  }
 
  static reject(reason) {
      return new MPromise((resolve, reject) => {
          reject(reason);
      });
  }
 
  static race(promiseList) {
      return new MPromise((resolve, reject) => {
          const length = promiseList.length;
 
          if (length === 0) {
              return resolve();
          } else {
              for (let i = 0; i < length; i++) {
                  MPromise.resolve(promiseList[i]).then(
                      (value) => {
                          return resolve(value);
                      },
                      (reason) => {
                          return reject(reason);
                      });
              }
          }
      });
  }
 
  static all(promiseArray) {
    return new MPromise(function(resolve, reject){
      if (!Array.isArray(promiseArray)){
        return reject(new TypeError('arguments must be array'))
      }
      const promiseNum = promiseArray.length
      const res = []
      let counter = 0
      for(let i = 0; i <promiseNum; i++){
        MPromise.resolve(promiseArray[i]).then(value=>{
          counter ++
          res[i] = value
          if(counter === promiseNum){
            resolve(res)
          }
        }).catch(e=>{
          reject(e)
        })
      }
    })
  }
}
