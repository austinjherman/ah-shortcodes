# Shortcode Parser
Need shortcodes? This unopinionated and extensible shortcode parser can process shortcodes anywhere in your content, from any CMS. 

## Usage

### In Your Content

This is an example of using the shortcode parser in content. {{ type: "replace", content: "Hello, world!" }}<br/>
  
-> This is an example of using the shortcode parser in content. Hello, world!

This is another example using variables. {{ type: "replace", content: "Hello, \\${b.nested.value}!" }}<br/>

-> This is another example uusing variables. Hello, variables!


### In Code
```javascript

import ShortcodeParser from '@austinjherman/ah-shortcodes';

// We can feed the parser an object of variables to 
// use in our shortcodes.
const variables = {
  a: "ice cream",
  b: {
    nested: {
      value: "variables"
    }
  },
  c: "wine"
};

// We can write a simple function to run over our content.
// This function will simply replace the shortcode with the 
// content inside of it.
const replaceParser = (content, obj, originalMatch) => {
  const objType = obj.type;
  if(objType === 'replace') {
    const updatedContent = obj.content;
    content = content.replace(originalMatch, updatedContent);
  }
  return content;
};
      
// Write as many filter functions as you want.
const filterFunctions = [replaceParser];

// Instantiate the parser.
sp = new ShortcodeParser(variables, filterFunctions);

// Resolve your shortcodes.
sp.parse("Your content here!! {{ type: 'replace', content: 'example' }}");
```

## Development

### Installation
- clone this repo
- `npm i`

### Run Tests
- `node ./test/shortcodeParser.test.js`