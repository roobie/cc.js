const assert = require('assert')

const contains = (list, elt) => !!~list.indexOf(elt)

function cc () {
  let fn = null
  let sealed = false

  const validate = () => {
    assert(!sealed, 'This contract is sealed')
  }

  const configuration = {
    pure: false,
    nothrow: false,
    throws: [assert.AssertionError],
    pre: [],
    post: []
  }

  configuration.toJSON = function () {
    return {
      pure: configuration.pure,
      nothrow: configuration.nothrow,
      throws: configuration.throws.map(x => x.name),
      pre: configuration.pre.map(f => f.toString()),
      post: configuration.post.map(f => f.toString())
    }
  }

  const configurationOptions = {
    pre: registerPreCondition,
    post: registerPostCondition,
    throws: registerError,
    nothrow: setNothrow,
    pure: setPure,
    seal: seal
  }

  function registerError (e) {
    validate()
    configuration.throws.push(e)
    return configurationOptions
  }

  function setNothrow () {
    validate()
    configuration.nothrow = true
    return configurationOptions
  }

  function setPure () {
    validate()
    configuration.pure = true
    return configurationOptions
  }

  function registerPreCondition (condition) {
    validate()
    configuration.pre.push(condition)
    return configurationOptions
  }

  function registerPostCondition (condition) {
    validate()
    configuration.post.push(condition)
    return configurationOptions
  }

  function seal (impl) {
    validate()
    sealed = true
    fn = impl
    return wrapper
  }

  function wrapper (...args) {
    for (let i = 0; i < configuration.pre.length; ++i) {
      const cond = configuration.pre[i]
      const failMsg =
              `The arguments must satisfy ${cond.toString()}`
      assert(cond.apply(this, args), failMsg)
    }

    let result = null
    try {
      result = fn.apply(this, args)
    } catch (e) {
      if (!configuration.nothrow) {
        const etype = e.constructor
        assert(
          contains(configuration.throws, etype),
          `Not a registered error [${etype.name}]`)
        throw e
      }
    }

    for (let i = 0; i < configuration.post.length; ++i) {
      const cond = configuration.post[i]
      const failMsg =
              `The return value must satisfy ${cond.toString()}`
      assert(cond(result), failMsg)
    }

    return result
  }

  wrapper.getContractInfo = () => configuration.toJSON()

  return configurationOptions
}

module.exports = cc
