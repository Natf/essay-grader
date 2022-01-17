// what we need to do here is break down an essay into what allows it to be scored
// we need to define features we can count and pass to the network
/*
List of features:

wordCount
numberOfSpellingErrors
numberOfUniqueWordsUsed
maximumTimesAWordIsRepeated
averageWordLength
averageSentenceLength
maximumWordLength
maximumSentenceLength


*/

/*
List of outputs:
each of these may need their own model


content 0 to 5
fluency 0 to 5
grammar 0 to 5
vocabulary 0 to 5
spelling 0 to 5

*/

let contentModel;
let fluencyModel;
let grammarModel;
let vocabModel;
let spellingModel;
let allInputs = [];
let allTargets = [];


    function setup() {
  let options = {
    inputs: [
      "wordCount",
      "level",
      "numberOfSpellingErrors",
      "numberOfUniqueWordsUsed",
      "maximumTimesAWordIsRepeated",
      "averageWordLength",
      "averageSentenceLength",
      "maximumWordLength",
      "maximumSentenceLength",
      "fleschKincaidReading",
      "fleschKincaidGrade"
    ],
    outputs: ["contentGrade", "fluencyGrade", "grammarGrade", "vocabularyGrade", "conventionsGrade"],
    task: 'regression',
    debug: 'true',
    layers: [
        {
          type: 'dense',
          units: 64,
          activation: 'relu'
        },
        {
          type: 'dense',
          units: 64,
          activation: 'relu'
        },
        {
          type: 'dense',
          units: 64,
          activation: 'relu'
        },
        {
          type: 'dense',
          units: 64,
          activation: 'relu'
        },
        {
          type: 'dense',
          activation: 'sigmoid'
        }
    ],
    learningRate: 0.01,
  };
  contentModel = ml5.neuralNetwork(options);


  $('.load-essays').on("click", function() {
    essayParser.loadEssaysFromTextArea();
    //loadEssays();
  });
  $('.train-models').on("click", function() {
      console.log("training");
    loadStrings('TrainingData/training-data-2.json', loadedDataFile);
  });

    $('.test-model').on("click", function() {
        console.log("Testing...");
        loadStrings('TrainingData/test-data.json', loadedTestingData);
    });

  $('.check-spelling').on("click", function() {
      console.log("checking spelling");
      let essayText = $('.essay-input').val();
      let check = spell.check(essayText);
      console.log(check);
  });

  $('.check-essay').on("click", function() {

        let level = parseInt($('.level').children("option:selected").val());
    let essayText = $('.essay-input').val();
    console.log(essayText);
    let dataSet = essayParser.countFeatures(essayText);
    let inputs = {
        wordCount: dataSet.wordCount,
        level: level,
        numberOfSpellingErrors: dataSet.numberOfSpellingErrors,
        numberOfUniqueWordsUsed: dataSet.numberOfUniqueWordsUsed,
        maximumTimesAWordIsRepeated: dataSet.maximumTimesAWordIsRepeated,
        averageWordLength: dataSet.averageWordLength,
        averageSentenceLength: dataSet.averageSentenceLength,
        maximumWordLength: dataSet.maximumWordLength,
        maximumSentenceLength: dataSet.maximumSentenceLength,
        fleschKincaidReading: dataSet.fleschKincaidReading,
        fleschKincaidGrade: dataSet.fleschKincaidGrade,
      }
    $('.essay-results').text(JSON.stringify(inputs) + essayText );
    contentModel.predict(inputs, gotResults);
   // fluencyModel.classify(inputs, gotResults);
  })
}

function loadedTestingData(dataLoaded) {
    let itemsProcessed = 0;

    allInputs = [];
    allTargets = [];

    dataLoaded.forEach(function(data) {
    itemsProcessed++;
    data = JSON.parse(data);

    data.forEach(function(dataSet) {
        let inputs = {
            wordCount: dataSet.wordCount,
            level: dataSet.level,
            numberOfSpellingErrors: dataSet.numberOfSpellingErrors,
            numberOfUniqueWordsUsed: dataSet.numberOfUniqueWordsUsed,
            maximumTimesAWordIsRepeated: dataSet.maximumTimesAWordIsRepeated,
            averageWordLength: dataSet.averageWordLength,
            averageSentenceLength: dataSet.averageSentenceLength,
            maximumWordLength: dataSet.maximumWordLength,
            maximumSentenceLength: dataSet.maximumSentenceLength,
            fleschKincaidReading: dataSet.fleschKincaidReading,
            fleschKincaidGrade: dataSet.fleschKincaidGrade,
        }

        if(typeof dataSet.contentGrade !== 'undefined') {
            let targets = {
                contentGrade: dataSet.contentGrade,
                fluencyGrade: dataSet.fluencyGrade,
                grammarGrade: dataSet.grammarGrade,
                vocabularyGrade: dataSet.vocabularyGrade,
                conventionsGrade: dataSet.conventionsGrade,
            }

            allInputs.push(inputs);
            allTargets.push(targets)
        }
    });

        //console.log(data);

        if(itemsProcessed === dataLoaded.length-2) {
            console.log("time to test");
            console.log(itemsProcessed);
            console.log(allInputs);
            console.log(allTargets);
            predictTestData();
        }
    });
}

function predictTestData() {
    contentModel.predictMultiple(allInputs, calculateError);

}

function calculateError(error, results) {
  if (error) {
    console.log(error);
    return;
  }

  console.log(results);
  return;
    let expectedValues = {
        contentGrade: 0,
        fluencyGrade: 0,
        grammarGrade: 0,
        vocabularyGrade: 0,
        conventionsGrade: 0,
    };
    let predictedValues = {
        contentGrade: 0,
        fluencyGrade: 0,
        grammarGrade: 0,
        vocabularyGrade: 0,
        conventionsGrade: 0,
    }

    let errors = {
        contentGrade: 0,
        fluencyGrade: 0,
        grammarGrade: 0,
        vocabularyGrade: 0,
        conventionsGrade: 0,
    };

    errors.contentGrade = Math.pow(expectedValues.contentGrade - predictedValues.contentGrade, 2);
    errors.fluencyGrade = Math.pow(expectedValues.fluencyGrade - predictedValues.fluencyGrade, 2);
    errors.grammarGrade = Math.pow(expectedValues.grammarGrade - predictedValues.grammarGrade, 2);
    errors.vocabularyGrade = Math.pow(expectedValues.vocabularyGrade - predictedValues.vocabularyGrade, 2);
    errors.conventionsGrade = Math.pow(expectedValues.conventionsGrade - predictedValues.conventionsGrade, 2);

    console.log(errors);
}

function loadedDataFile(dataLoaded) {
    let itemsProcessed = 0;

    dataLoaded.forEach(function(data) {
    itemsProcessed++;
    data = JSON.parse(data);

    data.forEach(function(dataSet) {
        let inputs = {
            wordCount: dataSet.wordCount,
            level: dataSet.level,
            numberOfSpellingErrors: dataSet.numberOfSpellingErrors,
            numberOfUniqueWordsUsed: dataSet.numberOfUniqueWordsUsed,
            maximumTimesAWordIsRepeated: dataSet.maximumTimesAWordIsRepeated,
            averageWordLength: dataSet.averageWordLength,
            averageSentenceLength: dataSet.averageSentenceLength,
            maximumWordLength: dataSet.maximumWordLength,
            maximumSentenceLength: dataSet.maximumSentenceLength,
            fleschKincaidReading: dataSet.fleschKincaidReading,
            fleschKincaidGrade: dataSet.fleschKincaidGrade,
        }

        if(typeof dataSet.contentGrade !== 'undefined') {
            let targets = {
                contentGrade: dataSet.contentGrade,
                fluencyGrade: dataSet.fluencyGrade,
                grammarGrade: dataSet.grammarGrade,
                vocabularyGrade: dataSet.vocabularyGrade,
                conventionsGrade: dataSet.conventionsGrade,
            }

            contentModel.addData(inputs, targets);
        }
    });

        //console.log(data);

        if(itemsProcessed === dataLoaded.length-2) {
        console.log("time to train");
        console.log(itemsProcessed);
        finishedLoadingTrainingData();
        }
    });


}

function finishedLoadingTrainingData() {
  contentModel.normalizeData();
  //fluencyModel.normalizeData();
  trainModel();
}

function trainModel(){
  console.log("training");
  const trainingOptions = {
    epochs: 50,
  }
  contentModel.train(trainingOptions, whileTraining, finishedTraining);
  //fluencyModel.train(trainingOptions, whileTraining, finishedTraining);
}

function whileTraining(epoch, loss)  {
  console.log(`epoch: ${epoch}, loss:${loss}`);
}

function finishedTraining() {
  console.log('Finished Training.');
  console.log(contentModel.data);
}

function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }

  console.log(results);
  $('.essay-results').text($('.essay-results').text()+"&nbsp;Predicted Score: " + results[0].contentGrade);
}
