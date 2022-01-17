A simple "attempted" student essay score assessor

Essays are graded on 5 criteria:
Content
Fluency
Grammar
Vocabulary
Conventions

Each of these is scored an integer 0-5
This project needs to be trained when ran. Then it will attempt to score any essays that are submitted.
I also added the option to parse essays from the HTML from the essay site.

The project currently only predicts the content score. It uses a regression model to predict the score and uses the following information from essays to try and predict the score:

```
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
```

To Run
```
node index.js
```
Navigate to localhost:3000
