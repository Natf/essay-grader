
/*var $ = require('jquery');
window.$ = $;*/
var FleschKincaid = require('flesch-kincaid');

window.fleschKincaid = FleschKincaid;

const nlp = require('compromise');

window.nlp = nlp;

var EssayParser = require('./javascript/essayParser.js');

var essayParser = new EssayParser();
window.essayParser = essayParser;
window.essayParser.init();

let test = "this is a test sentence.";
console.log(FleschKincaid.rate(test));

var Typo = require("typo-js");
var dictionary = new Typo("en_US", false, false, { dictionaryPath: "/dictionaries" });
window.dictionary = dictionary;
console.log(dictionary.check("misspelled"));
