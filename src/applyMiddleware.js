import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */

// 把这个改写成ES5
/*return function (next) {
  function (reducer, initialState) {
    var store = next(reducer, initialState)
    var dispatch = store.dispatch
    var chain = []

    var middlewareAPI = {
      getState: store.getState,
      dispatch: function (action) {
        return dispatch(action)
      }
    }
    chain = middlewares.map(function (middleware) {
      return middleware(middlewareAPI)
    })
    dispatch = compose(...chain)(store.dispatch)
    return {
      ...store,
      dispatch
    }
  }
}*/

// 拿个例子看看
/*const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware,
  createLogger()
)(createStore)
const store = createStoreWithMiddleware(rootReducer, initialState)

*/

// 参照上面这个例子： 参数thunkMiddleware和createLogger()是...middlewares
// createStore是next
// rootReducer, initialState是reducer, initialState


// middlewares是数组
//
export default function applyMiddleware(...middlewares) {
  return (next) => (reducer, initialState) => {
    var store = next(reducer, initialState)
    var dispatch = store.dispatch
    var chain = []

    var middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    }
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }

}

function test() {
  return function (a) {

  }
}
