/**
 * Composes single-argument functions from right to left.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing functions from right to
 * left. For example, compose(f, g, h) is identical to arg => f(g(h(arg))).
 */
// compose(f, g, h) 等价于 arg => f(g(h(arg))).
// rest.reduceRight( (composed, f) => f(composed), last(...args) )
// 可以理解成每次把上次的执行结果当成下一次的参数
export default function compose(...funcs) {
  return (...args) => {
    if (funcs.length === 0) {
      return args[0]
    }

    const last = funcs[funcs.length - 1]
    const rest = funcs.slice(0, -1)

    return rest.reduceRight( (composed, f) => f(composed), last(...args) )
  }
}

// 写了个简单的例子，可以简单理解下上述fp的写法，虽然说起来只是语法糖，可是很屌有木有
//  For example, compose(f, g, h) is identical to arg => f(g(h(arg))).
//  看到这句话我就有点震惊了，可见我的无知
/*function f2(args) {
  return '; f2-' + args;
}

function f3(args) {
  return '; f3-' + args;
}

function f4(args) {
  return '; f4-' + args;
}

function applyArgs(...args) {
  return (...gg) => {
    const last = args[args.length - 1]
    const rest = args.slice(0, -1)
    return rest.reduceRight( (composed, f) => f(composed), last(...gg) )
    // return rest.reduceRight(function (composed, f) {
    //   return f(composed);
    // }, last(...gg));
  }
}

console.log(applyArgs(f2, f3, f4)('begin-'))*/
