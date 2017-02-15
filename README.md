# cc.js
Code contracts for JavaScript

## Example

```javascript
  function isNumeric (n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
  }

  const checkedDivision = cc()
          // Check that both arguments are numeric
          .pre((num, denom) => isNumeric(num) && isNumeric(denom))
          // Check that none of the arguments are a zero
          .pre((num, denom) => num !== 0 && denom !== 0)
          // Check that the result is not a zero
          .post((result) => result !== 0)
          // Check that the result is numeric
          .post((result) => isNumeric(result))
          // We can access the arguments in a post condition as well
          .post((result, [num, denom]) => {
            return (num === denom && result === num) ||
              result !== num && result !== denom
          })
          // guaranteed to not throw when invoking the function
          // AssertionError's will still be thrown if any pre/post
          // condition is not satisfied.
          .nothrow()
          // purely informational (i.e. not checked by the library)
          .pure()
          // actual implementation
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
```
