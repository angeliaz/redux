import { ActionTypes } from './createStore'
import isPlainObject from './utils/isPlainObject'
import mapValues from './utils/mapValues'
import pick from './utils/pick'

/* eslint-disable no-console */

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type
  var actionName = actionType && `"${actionType.toString()}"` || 'an action'

  return (
    `Reducer "${key}" returned undefined handling ${actionName}. ` +
    `To ignore an action, you must explicitly return the previous state.`
  )
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action) {
  var reducerKeys = Object.keys(reducers)
  var argumentName = action && action.type === ActionTypes.INIT ?
    'initialState argument passed to createStore' :
    'previous state received by the reducer'

  if (reducerKeys.length === 0) {
    return (
      'Store does not have a valid reducer. Make sure the argument passed ' +
      'to combineReducers is an object whose values are reducers.'
    )
  }

  if (!isPlainObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "` +
      ({}).toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      `". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join('", "')}"`
    )
  }

  var unexpectedKeys = Object.keys(inputState).filter(key => !reducers.hasOwnProperty(key))

  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'} ` +
      `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
      `Expected to find one of the known reducer keys instead: ` +
      `"${reducerKeys.join('", "')}". Unexpected keys will be ignored.`
    )
  }
}

// 对reducer做合法性检测
// store = Redux.createStore(reducer, initialState) -->
// currentState = initialState
// currentState = currentReducer(currentState, action);
//
// 从调用关系,调用时机来看, store.getState() 的初始值(currentState)
// 为 currentReducer(initialState, { type: ActionTypes.INIT })
//
// 1. 在初始化阶段,reducer 传入的 state 值是 undefined,此时,需要返回初始state,且初始state不能为undefined
// 2. 当传入不认识的 actionType 时, reducer(state, {type}) 返回的不能是undefined
// 3. redux/ 这个 namespace 下的action 不应该做处理,直接返回 currentState 就行 (谁运气这么差会去用这种actionType...)
function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(key => {
    var reducer = reducers[key]
    var initialState = reducer(undefined, { type: ActionTypes.INIT })

    if (typeof initialState === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
        `If the state passed to the reducer is undefined, you must ` +
        `explicitly return the initial state. The initial state may ` +
        `not be undefined.`
      )
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.')
    if (typeof reducer(undefined, { type }) === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined when probed with a random type. ` +
        `Don't try to handle ${ActionTypes.INIT} or other actions in "redux/*" ` +
        `namespace. They are considered private. Instead, you must return the ` +
        `current state for any unknown actions, unless it is undefined, ` +
        `in which case you must return the initial state, regardless of the ` +
        `action type. The initial state may not be undefined.`
      )
    }
  })
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */

export default function combineReducers(reducers) {
  // 返回一个对象, key => value 且value是function(其实就是过滤掉非function)
  var finalReducers = pick(reducers, (val) => typeof val === 'function')
  var sanityError

  try {
    // 对所有的子reducer 做一些合法性断言,如果没有出错再继续下面的处理
    // 合法性断言的内容,见API注释
    assertReducerSanity(finalReducers)
  } catch (e) {
    sanityError = e
  }

  return function combination(state = {}, action) {
    if (sanityError) {
      throw sanityError
    }

    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action)
      if (warningMessage) {
        console.error(warningMessage)
      }
    }

    var hasChanged = false
    var finalState = mapValues(finalReducers, (reducer, key) => {
      var previousStateForKey = state[key]
      var nextStateForKey = reducer(previousStateForKey, action)
      // 任一个reducer返回的是undefined,抛出错误
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
      return nextStateForKey
    })

    return hasChanged ? finalState : state
  }
}
