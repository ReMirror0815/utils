// call
Function.prototype.call = function (context, ...args) {
    context = context || window;

    const fnSymbol = Symbol("fn");
    context[fnSymbol] = this;

    context[fnSymbol](...args);
    delete context[fnSymbol];
}

// apply
Function.prototype.apply = function (context, argsArr) {
    context = context || window;

    const fnSymbol = Symbol("fn");
    context[fnSymbol] = this;

    context[fnSymbol](...argsArr);
    delete context[fnSymbol];
}

// bind
Function.prototype.bind = function (context, ...args) {
    context = context || window;
    const fnSymbol = Symbol("fn");
    context[fnSymbol] = this;

    return function (..._args) {
        args = args.concat(_args);

        context[fnSymbol](...args);
        delete context[fnSymbol];
    }
}

// new
function mockNew(Constructor, ...args) {
    const newObj = Object.create(Constructor.prototype);

    const res = Constructor.apply(newObj, args);

    return typeof res === 'object' ? res : newObj;
}
