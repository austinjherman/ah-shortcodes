/**
 | -----------------------------------------------------------------------------------------
 | shortcodeParser
 | ---------------------------------------------------------------------------------------
 *
 * TODO 
 *
 */

const json5 = require('json5');
const findInObject = require('./findInObject');


/**
 * ShortcodeParser
 * 
 * TODO
 * 
 */
class ShortcodeParser {

  /**
   * constructor
   * 
   * TODO
   * 
   * @param {*} accessibleVariables 
   * @param {*} filterFunctions 
   */
  constructor(accessibleVariables = [], filterFunctions = []) {
    this.accessibleVariables = accessibleVariables;
    this.filterFunctions = filterFunctions;
    this.parse = this.parse.bind(this);
    this.replaceVariables = this.replaceVariables.bind(this);
    this.resolveShortcodesRecursively = this.resolveShortcodesRecursively.bind(this);
    this.createShortcodeObjectRepresentation = this.createShortcodeObjectRepresentation.bind(this);
  }


  /**
   * parse
   * 
   * TODO
   * 
   * @param {string} fullContentChunk 
   * @returns {string}
   */
  parse(fullContentChunk) {
    fullContentChunk = this.replaceVariables(fullContentChunk);
    fullContentChunk = this.resolveShortcodesRecursively(fullContentChunk);
    return fullContentChunk;
  }


  /**
   * replaceVariables
   * 
   * This method uses regex to find matches that have the "${...}" 
   * structure. Once a match is found, it will attempt to match the structure of what's 
   * inside to an object in the "accessibleVariables" object that the parser was 
   * initialized with. It will replace the match with the value it finds or throw an 
   * error if the value does not exist.
   *
   * @param {string} content
   */
  replaceVariables(fullContentChunk) {
  
    const regex = RegExp(/\${\s*(.*?)\s*}/g);
    const matches = fullContentChunk.match(regex);

    if(matches && matches.length && matches.length > 0) {
      matches.forEach(match => {
        const originalMatch = match;
        match = match
                  .replace(/\${/, '')
                  .replace(/}/, '');
        const replacement = findInObject(match, this.accessibleVariables, true);
        fullContentChunk = fullContentChunk.replace(originalMatch, replacement);
      });
    }

    return fullContentChunk;
  };


  /**
   * resolveShortcodesRecursively
   * 
   * TODO
   * 
   * @param {string} fullContentChunk 
   */
  resolveShortcodesRecursively(fullContentChunk) {

    let openBr = 0,
        shortcodeJsonChars = [],
        shortcodes = [];
  
    fullContentChunk.split('').forEach((char, idx) => {
  
      // Find an instance of "{{" in the content and start counting
      if(char === "{" && idx > 0 && fullContentChunk[idx - 1] === "{") {
        openBr += 1;
      }
  
      // Find an instance of "}}" in the content and decrement counter
      else if(char === "}" && idx > 0 && fullContentChunk[idx - 1] === '}') {
        openBr -= 1;
      }
  
      // If our counter is greater than zero we want to save the characters,
      // as these would be the characters inside the {{ ... }}. This also is
      // inclusive of the inner "{}", which is convenient because we're going
      // to attempt to turn all this into an object anyway.
      if(openBr > 0) {  
        shortcodeJsonChars.push(char);
      }
      
      // If our counter is 0 and we have chars, then we've found a full shortcode.
      // Now we'll push this to an array and collect more (sequential) shortcodes if 
      // they exist.
      if(openBr === 0 && shortcodeJsonChars.length) {

        const shortcodeString = shortcodeJsonChars.join('');
        const shortcodeObject = this.createShortcodeObjectRepresentation(shortcodeString);

        // the following if/else block is pretty special
        // if we have shortcode content, then we'll attempt to resolve nested shortcodes
        // in that content 
        if(shortcodeObject.content) {

          // attempt to resolve inner shortcodes
          const innerResolve = this.resolveShortcodesRecursively(shortcodeObject.content);

          // if the innerResolve is different than the original shortcode content, 
          // then we've resolved a nested shortcode and need to update the full content 
          // so that subsequent iterations have updated content
          if(innerResolve != shortcodeObject.content) {
            fullContentChunk = this.resolveShortcodesRecursively(innerResolve);
          }

          // in the event that we didn't resolve a nested shortcode, we'll push the parent
          // shortcode to the shortcodes array for processing
          else shortcodes.push(shortcodeString);
        }

        // in the event that the shortcode doesn't have a content property, we'll push
        // the parent shortcode to the shortcodes array for processing
        else {
          shortcodes.push(shortcodeString);
        }

        shortcodeJsonChars = [];
      }
    });

    // check if we've collected (sequential) shortcodes in the string. If we have, we'll 
    // resolve them now.
    if(shortcodes.length) {

      shortcodes.forEach(shortcodeString => {

        const shortcodeObject = this.createShortcodeObjectRepresentation(shortcodeString);

        fullContentChunk = this.resolveShortcode(
          fullContentChunk,
          shortcodeObject,
          `{${shortcodeString}}`
        );

      });
    }
  
    return fullContentChunk;
  }


  /**
   * createShortcodeObjectRepresentation
   * 
   * TODO
   * 
   * @param {string} rawShortcodeString 
   */
  createShortcodeObjectRepresentation(rawShortcodeString) {
    try {
      return json5.parse(rawShortcodeString);
    }
    catch(err) {
      console.error('couldn\'t parse the following object: ', rawShortcodeString);
      throw new Error('There was an error during shortcode processing. Check your JS object syntax.', err);
    }
  }


  /**
   * resolveShortcode
   * 
   * TODO
   * 
   * @param {string} fullContentChunk
   * @param {object - {type: string!} } 
   * @param {string} shortcodeString - The full match that was found ( e.g. "{{...}}" )
   */
  resolveShortcode(fullContentChunk, shortcodeObject, shortcodeString) {
    this.filterFunctions.forEach(f => {
      fullContentChunk = f(fullContentChunk, shortcodeObject, shortcodeString);
    });
    return fullContentChunk;
  };

};

module.exports = ShortcodeParser;