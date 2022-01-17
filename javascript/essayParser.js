module.exports = class EssayParser {
    constructor() {
        this.levelsLookup = {
          li: 1,
          la: 2,
          ls: 3,
          mi: 4,
          ma: 5,
          ms: 6,
          pa: 7,
          ps: 8,
          pm: 9,
          pr: 10,
        }
        this.levelRegex = /(21|22)[a-zA-Z]{2}.{4}/
    }

    init() {
        $( document ).ready(function() {
            $('.reload-training-data').on("click", function() {
                console.log("Loading training data...");
                loadStrings('TrainingData/training-data.json', essayParser.loadedEssaysFromTrainingData);
            });
        });
    }

    loadEssays(essaysToLoad = "Essays/Essays-ps3s.txt") {
      $('.essays').load(essaysToLoad, loadedEssays);
    }

    loadEssaysFromTextArea() {
      $('.essays').html($('.essay-add-input').val());
      this.loadedEssays();
      $('.essay-add-input').html('');
    }

    loadedEssaysFromTrainingData(dataLoaded) {
      let itemsProcessed = 0;
      let allData = [];

      dataLoaded.forEach(function(data) {
        itemsProcessed++;
        allData = allData.concat(JSON.parse(data));

        if(itemsProcessed === dataLoaded.length-2) {
          console.log("Finished Loading data file");
          console.log(allData);
          essayParser.recalculateFeaturesForTrainingData(allData);
          return;
        }
      });
    }

    recalculateFeaturesForTrainingData(essayData) {
        console.log("Recalculating training data...");
        essayData.forEach(function(data, index) {
            let newData = essayParser.countFeatures(data.essayContent, data.level);

            if (newData !== null) {
                newData.contentGrade = data.contentGrade;
                newData.fluencyGrade = data.fluencyGrade;
                newData.grammarGrade = data.grammarGrade;
                newData.vocabularyGrade = data.vocabularyGrade;
                newData.conventionsGrade = data.conventionsGrade;
                essayData[index] = newData;
            }
        });

        saveStrings([JSON.stringify(essayData)], "recalculatedData.json");
    }

    loadedEssays() {
      let essays = $('.print_box');
      let allContent = "";
      let essayData = [];
      let levelsLookup = this.levelsLookup;
      let levelRegex = this.levelRegex;

      essays.each(function(index, essay) {
        let content = $(essay).find('.print_content > pre').text();
        let scores = $(essay).find('.evaluation > table > tbody > tr');
        let level = $(essay).find('.print_info > .li_right');
        level = level.text().match(levelRegex)[0];
        level = level.substring(level.length-2).toLowerCase();
        level = levelsLookup[level];
        let scoreValues = [];
        scores.each(function(index, element) {

          // ignore 0,3,5
          if (index === 0 || index === 3) {
            return;
          }

          let scoreFields = $(element).find("td");

          let score = 0;
          scoreFields.each(function(scoreIndex, scoreField) {

            // ignore 0, 1, 7
            if (scoreIndex === 0 || scoreIndex === 1) {
              return;
            }

            if ($(scoreField).children("img").length) {
              score = scoreIndex - 2;
            }
          });

          scoreValues.push(score);
        });
        let contentFeatures = essayParser.countFeatures(content, level);

        if(contentFeatures === null) {
          return;
        }


        contentFeatures.contentGrade = scoreValues[0];
        contentFeatures.fluencyGrade = scoreValues[1];
        contentFeatures.grammarGrade = scoreValues[2];
        contentFeatures.vocabularyGrade = scoreValues[3];
        contentFeatures.conventionsGrade = scoreValues[4];
        contentFeatures.essayContent = content;
        essayData.push(contentFeatures);

        allContent+= scoreValues.join() +"<br>"+JSON.stringify(contentFeatures).replaceAll(",",",<br>")+"<br>" + content +"<br><br>";
      });

      saveStrings([JSON.stringify(essayData)], "test.txt");

      //$('.parsed-essays').html(allContent);
      console.log(essays);
      $('.essays').text("");
    }

    countFeatures(essayContent, level = 6) {
      let features = {
        wordCount: 0,
        level: level,
        numberOfSpellingErrors: 0,
        numberOfUniqueWordsUsed: 0,
        maximumTimesAWordIsRepeated: 0,
        averageWordLength: 0,
        averageSentenceLength: 0,
        maximumWordLength: 0,
        maximumSentenceLength: 0,
        essayContent: "",
        fleschKincaidReading: 0,
        fleschKincaidGrade: 0,
      }

      let essayNLP = nlp(essayContent);
      essayContent.normalize();
      let words = essayParser.splitIntoWords(essayNLP);
      let sentences = essayParser.splitIntoSentences(essayNLP);

      let uniqueWords = essayParser.getNumberOfUniqueWords(words);
      let wordCounts = Object.values(uniqueWords);

      wordCounts.sort(function(a, b){return b-a});

      features.wordCount = essayNLP.wordCount();
      features.numberOfSpellingErrors = essayParser.checkSpelling(Object.keys(uniqueWords));
      features.numberOfUniqueWordsUsed = Object.keys(uniqueWords).length;
      features.maximumTimesAWordIsRepeated = wordCounts[0];
      features.averageWordLength = essayParser.getAverageWordLength(words);
      features.averageSentenceLength = essayParser.getAverageSentenceLength(sentences);
      features.maximumWordLength = essayParser.getMaximumWordLength(words);
      features.maximumSentenceLength = essayParser.getMaximumSentenceLength(sentences);
      features.fleschKincaidReading = fleschKincaid.rate(essayContent);
      features.fleschKincaidGrade = fleschKincaid.grade(essayContent);
      features.essayContent = essayContent;

      if (features.averageSentenceLength === null) {
        return null;
      }

      return features;
    }

    checkSpelling(uniqueWords) {
        let numberOfSpellingErrors = 0;
        uniqueWords.forEach(function(word) {
            if(!dictionary.check(word)) {
                numberOfSpellingErrors ++;
            }
        })

        return numberOfSpellingErrors;
    }

    splitIntoSentences(essayNLP) {
      let sentences = essayNLP.sentences();

      return sentences;
    }

    splitIntoWords(essayNLP) {
        let words = essayNLP.terms().out('array');
        let cleanedWords = [];
        words.forEach(function(word) {
            word = essayParser.cleanWord(word);
            if (word != "") {
                cleanedWords.push(word);
            }
        });

        return cleanedWords;
    }

    getAverageWordLength(words) {
      let totalSize = 0;
      words.forEach(function(word) {
        totalSize += word.split('').length;
      })
      return (totalSize/words.length);
    }

    getAverageSentenceLength(sentences) {
      let totalSize = 0;
      if (sentences === null) {
        return null;
      }

      sentences.forEach(function(sentence) {
        let numberOfWords = sentence.terms().out('array').length;
        totalSize += numberOfWords;
      })
      return (totalSize/sentences.length);
    }

    getMaximumWordLength(words) {
      let maximum = 0;
      words.forEach(function(word) {

        if(word.split('').length > maximum) {
          maximum = word.split('').length;
        }
      })
      return maximum;
    }

    getMaximumSentenceLength(sentences) {
      let maximum = 0;

      if (sentences === null) {
        return null;
      }

      sentences.forEach(function(sentence) {
        let words = essayParser.splitIntoWords(sentence);

        if (words.length > maximum) {
          maximum = words.length;
        }
      })
      return maximum;
    }

    getNumberOfUniqueWords(words) {
      let uniqueWords = {};

      words.forEach(function(word) {
        if (word in uniqueWords) {
          uniqueWords[word] ++;
        } else {
          uniqueWords[word] = 1;
        }
      });

      return uniqueWords;
    }

    cleanWord(word) {
      word = word.trim().match(/[A-Za-z']+/);

      if (!word) {
        return "";
      }

      word = word[0];
      if (!word) {
        return "";
      }

      return word;
    }
}
