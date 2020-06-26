const assert = require('assert').strict,
      ShortcodeParser = require('../src/shortcodeParser'),
      findInObject = require('../src/findInObject');


const someRandomAssVariables = {
  a: "ice cream",
  b: {
    nested: {
      value: "beer"
    }
  },
  c: {
    w: {
      t: {
        f: "cheese"
      }
    }
  },
  d: "wine"
};


const replaceParser = (content, obj, originalMatch) => {
  const objType = findInObject('type', obj);
  if(objType === 'replace') {
    const updatedContent = findInObject('content', obj);
    content = content.replace(originalMatch, updatedContent);
  }
  return content;
};
      

const filterFunctions = [replaceParser];


sp = new ShortcodeParser(someRandomAssVariables, filterFunctions);

// can resolve variables
assert.equal(sp.parse('${a}'), 'ice cream');
assert.equal(sp.parse(`\${a}`), 'ice cream');


// can resolve sequential variables
assert.equal(sp.parse(`\${a}\${a}`), 'ice creamice cream');


// can resolve shortcodes
assert.equal(sp.parse(`{{ type: "replace", content: "hello world" }}`), 'hello world');


// can resolve shortcodes with variables inside
assert.equal(sp.parse(`{{ type: "replace", content: "hello \${b.nested.value}" }}`), 'hello beer');


// can resolve suquential shortcodes
assert.equal(sp.parse(`{{type: "replace", content: "hello world"}} {{ type: "replace", content: "hello \${b.nested.value}" }}`), 'hello world hello beer');


// resolves shortcodes in place and doesn't overwrite surrounding text
assert.equal(
  sp.parse(`here's some !!{{type: "replace", content: "\${c.w.t.f}"}}!! surrounding text ya filthy animal.`), 
  `here's some !!cheese!! surrounding text ya filthy animal.`
)


// doesn't alter shortcodes that don't match type checks
assert.equal(sp.parse(`{{ type: "doesn't exist" }}`), `{{ type: "doesn't exist" }}`);


// can resolve nested shortcodes
assert.equal(sp.parse(`{{ type: "replace", content: "{{ type: 'replace', content: 'inner' }}" }}`), 'inner');


// can resolve sequential nested shortcodes
assert.equal(sp.parse(`{{ type: "replace", content: "{{ type: 'replace', content: 'first inner' }}" }} {{ type: "replace", content: "{{ type: 'replace', content: 'second inner' }}" }}`), 'first inner second inner');