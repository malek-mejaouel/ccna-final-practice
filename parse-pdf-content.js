
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'dataset', 'pdf-content-new.txt'), 'utf8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const questions = [];
let questionId = 1;
let i = 0;

while (i < lines.length) {
  const line = lines[i];
  
  const questionMatch = line.match(/^(\d+)\. (.+)$/);
  
  if (questionMatch && !line.includes('Associez') && !line.includes('Reportez-vous à l’illustration')) {
    let questionText = questionMatch[2];
    i++;
    
    while (i < lines.length && 
           !lines[i].startsWith('●') && 
           !lines[i].match(/^(\d+)\. /) && 
           !lines[i].startsWith('Explique:') &&
           !lines[i].startsWith('Expliquer :') &&
           !lines[i].startsWith('-- ')) {
      questionText += ' ' + lines[i];
      i++;
    }

    let isMulti = questionText.includes('Choisissez deux') || 
                  questionText.includes('Choisissez trois') ||
                  questionText.includes('Sélectionnez deux') ||
                  questionText.includes('Sélectionnez trois');
    
    let correctCount = 1;
    if (questionText.includes('Choisissez deux') || questionText.includes('Sélectionnez deux')) {
      correctCount = 2;
    } else if (questionText.includes('Choisissez trois') || questionText.includes('Sélectionnez trois')) {
      correctCount = 3;
    }

    const choices = [];
    while (i < lines.length && lines[i].startsWith('●')) {
      let choiceText = lines[i].slice(1).trim();
      i++;
      while (i < lines.length && 
             !lines[i].startsWith('●') && 
             !lines[i].match(/^(\d+)\. /) && 
             !lines[i].startsWith('Explique:') &&
             !lines[i].startsWith('Expliquer :') &&
             !lines[i].startsWith('-- ')) {
        choiceText += ' ' + lines[i];
        i++;
      }
      const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
      choices.push({
        label: labels[choices.length],
        text: choiceText
      });
    }

    let explanation = '';
    if (i < lines.length && (lines[i].startsWith('Explique:') || lines[i].startsWith('Expliquer :'))) {
      explanation = lines[i];
      i++;
      while (i < lines.length && 
             !lines[i].match(/^(\d+)\. /) && 
             !lines[i].startsWith('-- ')) {
        explanation += ' ' + lines[i];
        i++;
      }
    }

    if (choices.length > 0) {
      questions.push({
        id: questionId++,
        question: questionText,
        image: null,
        choices: choices,
        correct: [],
        multi: isMulti,
        correctCount: correctCount,
        explanation: explanation
      });
    }
  } else {
    i++;
  }
}

console.log('Parsed', questions.length, 'questions!');

fs.writeFileSync(path.join(__dirname, 'base-questions.json'), JSON.stringify(questions, null, 2));
console.log('Wrote base-questions.json');
