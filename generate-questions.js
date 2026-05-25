
const fs = require('fs');
const path = require('path');

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const baseQuestions = require('./base-questions.json');

const shuffledQuestions = shuffleArray(baseQuestions);
const selectedQuestions = shuffledQuestions.slice(0, Math.min(30, shuffledQuestions.length));

const numberedQuestions = selectedQuestions.map((q, index) => ({
  ...q,
  id: index + 1
}));

fs.writeFileSync(path.join(__dirname, 'questions.json'), JSON.stringify(numberedQuestions, null, 2));
console.log(`Generated ${numberedQuestions.length} unique questions with correct answers!`);
