/**
 * findInObject
 * 
 * This is a recursive function that can find nested
 * values in an object via a string using dot syntax. 
 * It's safe in that if at any level the value is undefined, 
 * it won't throw an error; it'll return undefined, instead.
 * 
 * If you'd like, you can choose to throw an error by using
 * the strictMode option. With this option enabled, an error
 * will be thrown if at any point a value is undefined.
 * 
 * findInObject('find.a.nested.value', obj)
 * 
 * @param {string} needle 
 * @param {object} haystack 
 * @author Austin Herman <austin.j.herman@gmail.com>
 * @returns any
 */

const findInObject = (needle, haystack, strictMode=false, originalNeedle=undefined) => {

  // for a more useful strictMode output we'll save
  // the original string
  if(originalNeedle === undefined) {
    originalNeedle = needle;
  }

  if(haystack === undefined) {
    if(strictMode) throw new Error(`Missing Value: ${originalNeedle} is undefined.`);
    return undefined;
  }

  const needles = needle.split('.');

  if(needles.length === 1) {
    if(strictMode && haystack[needle] === undefined)
      throw new Error(`Missing Value: ${originalNeedle} is undefined.`);
    return haystack[needle];
  }

  const first = needles.splice(0, 1).join('.'); // remember splice mutates
  return findInObject(needles.join('.'), findInObject(first, haystack, strictMode, originalNeedle), strictMode, originalNeedle);

};

module.exports = findInObject;