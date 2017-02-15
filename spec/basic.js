
const tap = require('tap')
const test = tap.test

const assert = require('assert')
const cc = require('../')

test('basic', t => {
  function isNumeric (n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
  }

  const checkedDivision = cc()
          .pre((num, denom) => isNumeric(num) && isNumeric(denom))
          .pre((num, denom) => num !== 0 && denom !== 0)
          .post((result) => isNumeric(result))
          .post((result) => result !== 0)
          .post((result, [num, denom]) => {
            return (num === denom && result === num) ||
              result !== num && result !== denom
          })
          .nothrow()
          .pure()
          .seal(function div (num, denom) {
            return num / denom
          })

  t.throws(() => checkedDivision(1, 0), assert.AssertionError)
  t.throws(() => checkedDivision('asd', 1), assert.AssertionError)
  t.doesNotThrow(() => checkedDivision(1, 1))
  t.equals(checkedDivision(1, 1), 1)
  t.equals(checkedDivision(10, 2), 5)
  t.equals(checkedDivision(1, 2), 0.5)
  t.equals(checkedDivision(1, 0.5), 2)
  t.equals(checkedDivision(1, -0.5), -2)
  t.equals(checkedDivision(-1, -0.5), 2)

  test('message', t => {
    try {
      checkedDivision(0, 0)
    } catch (e) {
      const msg = e.message
      t.ok(msg.includes('(num, denom) => num !== 0 && denom !== 0'))
    }

    t.end()
  })

  test('message', t => {
    try {
      checkedDivision('asd', 'asd')
    } catch (e) {
      const msg = e.message
      t.ok(msg.includes(
        '(num, denom) => isNumeric(num) && isNumeric(denom)'))
    }

    t.end()
  })

  test('doc', t => {
    const info = checkedDivision.getContractInfo()
    t.equals(info.throws[0], 'AssertionError')
    t.end()
  })

  test('checked Errors', t => {
    const fn = cc()
            .seal(function throwsTypeError () {
              throw new TypeError()
            })

    t.throws(() => fn(), assert.AssertionError)
    t.end()
  })

  test('nothrow', t => {
    const fn = cc()
            .nothrow()
            .seal(function throwsTypeError () {
              throw new TypeError()
            })

    t.doesNotThrow(() => fn(), assert.AssertionError)
    t.end()
  })

  t.end()
})

