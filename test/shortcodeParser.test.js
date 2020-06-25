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

assert.equal(sp.parse('${a}'), 'ice cream');
assert.equal(sp.parse(`\${a}`), 'ice cream');

assert.equal(sp.parse(`{{ type: "replace", content: "hello world" }}`), 'hello world');
assert.equal(sp.parse(`{{ type: "replace", content: "hello \${b.nested.value}" }}`), 'hello beer');

assert.equal(
  sp.parse(`here's some !!{{type: "replace", content: "\${c.w.t.f}"}}!! surrounding text ya filthy animal.`), 
  `here's some !!cheese!! surrounding text ya filthy animal.`
)

assert.equal(sp.parse(`{{ type: "doesn't exist" }}`), `{{ type: "doesn't exist" }}`);


// WTF AHHHHHHH
assert.equal(sp.parse(`{{ type: "replace", content: "{{ type: 'replace', content: 'inner' }}" }}`), 'inner');