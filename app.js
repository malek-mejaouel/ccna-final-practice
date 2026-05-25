
const EXAM_LENGTH = 30;
const TIME_LIMIT = 15 * 60;
const PASSING_PERCENTAGE = 70;
let currentUsername = '';

let allQuestions = [];
let examQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let flaggedQuestions = new Set();
let timerInterval = null;
let timeRemaining = TIME_LIMIT;
let startTime = null;

const screens = {
  start: document.getElementById('start-screen'),
  exam: document.getElementById('exam-screen'),
  results: document.getElementById('results-screen'),
  review: document.getElementById('review-screen')
};

const elements = {
  startBtn: document.getElementById('start-btn'),
  usernameInput: document.getElementById('username-input'),
  totalQuestions: document.getElementById('total-questions'),
  timer: document.getElementById('timer'),
  progressBar: document.getElementById('progress-bar'),
  questionGrid: document.getElementById('question-grid'),
  questionNumber: document.getElementById('question-number'),
  flagBtn: document.getElementById('flag-btn'),
  questionText: document.getElementById('question-text'),
  questionImage: document.getElementById('question-image'),
  choicesContainer: document.getElementById('choices-container'),
  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn'),
  submitBtn: document.getElementById('submit-btn'),
  resultsTitle: document.getElementById('results-title'),
  scoreValue: document.getElementById('score-value'),
  scorePercentage: document.getElementById('score-percentage'),
  passFail: document.getElementById('pass-fail'),
  timeTaken: document.getElementById('time-taken'),
  reviewBtn: document.getElementById('review-btn'),
  retakeBtn: document.getElementById('retake-btn'),
  backToResultsBtn: document.getElementById('back-to-results-btn'),
  reviewGrid: document.getElementById('review-grid'),
  reviewQuestionNumber: document.getElementById('review-question-number'),
  reviewQuestionText: document.getElementById('review-question-text'),
  reviewQuestionImage: document.getElementById('review-question-image'),
  reviewChoicesContainer: document.getElementById('review-choices-container'),
  explanationContainer: document.getElementById('explanation-container'),
  reviewPrevBtn: document.getElementById('review-prev-btn'),
  reviewNextBtn: document.getElementById('review-next-btn'),
  leaderboard: document.getElementById('leaderboard')
};

function fisherYatesShuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function shuffleChoices(question) {
  const correctChoiceTexts = question.choices
    .filter(c => question.correct.includes(c.label))
    .map(c => c.text);
  
  const shuffledChoices = fisherYatesShuffle(question.choices);
  
  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const relabeledChoices = shuffledChoices.map((choice, index) => ({
    ...choice,
    label: labels[index]
  }));
  
  const newCorrect = relabeledChoices
    .filter(c => correctChoiceTexts.includes(c.text))
    .map(c => c.label);
  
  return {
    ...question,
    choices: relabeledChoices,
    correct: newCorrect
  };
}

function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getLeaderboard() {
  try {
    const leaderboard = localStorage.getItem('leaderboard');
    return leaderboard ? JSON.parse(leaderboard) : [];
  } catch (e) {
    return [];
  }
}

function saveToLeaderboard(username, score, percentage, timeTaken) {
  const leaderboard = getLeaderboard();
  leaderboard.push({
    username,
    score,
    percentage,
    timeTaken,
    date: new Date().toLocaleDateString()
  });
  leaderboard.sort((a, b) => b.percentage - a.percentage);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
  renderLeaderboard();
}

function renderLeaderboard() {
  const leaderboard = getLeaderboard();
  elements.leaderboard.innerHTML = '';
  
  if (leaderboard.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'leaderboard-empty';
    empty.textContent = 'No scores yet - be the first!';
    elements.leaderboard.appendChild(empty);
    return;
  }

  leaderboard.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = 'leaderboard-item';
    
    const rank = document.createElement('div');
    rank.className = 'leaderboard-rank';
    if (index === 0) rank.classList.add('gold');
    else if (index === 1) rank.classList.add('silver');
    else if (index === 2) rank.classList.add('bronze');
    rank.textContent = index + 1;
    
    const name = document.createElement('div');
    name.className = 'leaderboard-name';
    name.textContent = entry.username;
    
    const score = document.createElement('div');
    score.className = 'leaderboard-score';
    score.textContent = `${entry.percentage}%`;
    
    item.appendChild(rank);
    item.appendChild(name);
    item.appendChild(score);
    elements.leaderboard.appendChild(item);
  });
}

async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    allQuestions = await response.json();
    if (elements.totalQuestions) {
      elements.totalQuestions.textContent = EXAM_LENGTH;
    }
    
    const savedState = localStorage.getItem('examState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (!state.examQuestions || state.examQuestions.length !== EXAM_LENGTH) {
          localStorage.removeItem('examState');
        }
      } catch (e) {
        localStorage.removeItem('examState');
      }
    }
    
    renderLeaderboard();
  } catch (error) {
    console.error('Error loading questions:', error);
  }
}

function startExam() {
  const username = elements.usernameInput.value.trim();
  if (!username) {
    alert('Please enter your name!');
    elements.usernameInput.focus();
    return;
  }
  
  currentUsername = username;
  const shuffledAll = fisherYatesShuffle(allQuestions);
  examQuestions = shuffledAll.slice(0, EXAM_LENGTH).map(shuffleChoices);
  currentQuestionIndex = 0;
  userAnswers = {};
  flaggedQuestions = new Set();
  timeRemaining = TIME_LIMIT;
  startTime = Date.now();

  saveExamState();
  showScreen('exam');
  renderQuestion();
  renderQuestionGrid();
  startTimer();
}

function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    saveExamState();
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      submitExam();
    }
  }, 1000);
}

function updateTimerDisplay() {
  elements.timer.textContent = formatTime(timeRemaining);
  if (timeRemaining < 180) {
    elements.timer.classList.add('warning');
  } else {
    elements.timer.classList.remove('warning');
  }
}

function renderQuestion() {
  const question = examQuestions[currentQuestionIndex];
  elements.questionNumber.textContent = `Question ${currentQuestionIndex + 1} / ${EXAM_LENGTH}`;
  elements.questionText.textContent = question.question;

  elements.questionImage.innerHTML = '';
  if (question.image) {
    const img = document.createElement('img');
    img.src = question.image;
    elements.questionImage.appendChild(img);
  }

  elements.choicesContainer.innerHTML = '';
  if (question.multi) {
    const hint = document.createElement('div');
    hint.className = 'multi-hint';
    if (question.correctCount) {
      hint.textContent = `(Select ${question.correctCount} correct answer${question.correctCount > 1 ? 's' : ''})`;
    } else {
      hint.textContent = '(Select all correct answers)';
    }
    elements.choicesContainer.appendChild(hint);
  }

  question.choices.forEach((choice, index) => {
    const choiceItem = document.createElement('div');
    choiceItem.className = 'choice-item';

    const input = document.createElement('input');
    input.type = question.multi ? 'checkbox' : 'radio';
    input.name = 'question-choice';
    input.className = 'choice-input';
    input.id = `choice-${index}`;
    input.value = choice.label;

    const label = document.createElement('label');
    label.htmlFor = `choice-${index}`;
    label.className = 'choice-label';
    label.textContent = `${choice.label}. ${choice.text}`;

    const currentAnswer = userAnswers[currentQuestionIndex];
    if (currentAnswer && (question.multi ? currentAnswer.includes(choice.label) : currentAnswer === choice.label)) {
      input.checked = true;
      choiceItem.classList.add('selected');
    }

    if (question.multi && question.correctCount && currentAnswer && currentAnswer.length >= question.correctCount && !currentAnswer.includes(choice.label)) {
      input.disabled = true;
      choiceItem.style.opacity = '0.5';
    }

    input.addEventListener('change', () => handleChoiceChange(choice.label, question.multi));
    choiceItem.addEventListener('click', (e) => {
      if (e.target !== input && !input.disabled) {
        input.checked = question.multi ? !input.checked : true;
        input.dispatchEvent(new Event('change'));
      }
    });

    choiceItem.appendChild(input);
    choiceItem.appendChild(label);
    elements.choicesContainer.appendChild(choiceItem);
  });

  elements.flagBtn.textContent = flaggedQuestions.has(currentQuestionIndex) ? 'Unflag' : 'Flag for Review';
  elements.prevBtn.disabled = currentQuestionIndex === 0;
  elements.nextBtn.style.display = currentQuestionIndex === EXAM_LENGTH - 1 ? 'none' : 'inline-block';
  elements.submitBtn.style.display = currentQuestionIndex === EXAM_LENGTH - 1 ? 'inline-block' : 'none';

  updateProgressBar();
  updateQuestionGrid();
}

function handleChoiceChange(label, isMulti) {
  if (isMulti) {
    const question = examQuestions[currentQuestionIndex];
    if (!userAnswers[currentQuestionIndex]) {
      userAnswers[currentQuestionIndex] = [];
    }
    const index = userAnswers[currentQuestionIndex].indexOf(label);
    if (index > -1) {
      userAnswers[currentQuestionIndex].splice(index, 1);
    } else {
      if (question.correctCount && userAnswers[currentQuestionIndex].length >= question.correctCount) {
        alert(`Please select only ${question.correctCount} answer${question.correctCount > 1 ? 's' : ''} for this question.`);
        renderQuestion();
        return;
      }
      userAnswers[currentQuestionIndex].push(label);
    }
  } else {
    userAnswers[currentQuestionIndex] = label;
  }

  const choiceItems = elements.choicesContainer.querySelectorAll('.choice-item');
  choiceItems.forEach(item => {
    const input = item.querySelector('.choice-input');
    item.classList.toggle('selected', input.checked);
  });

  saveExamState();
  updateQuestionGrid();
}

function updateProgressBar() {
  const answeredCount = Object.keys(userAnswers).length;
  const progress = (answeredCount / EXAM_LENGTH) * 100;
  elements.progressBar.style.width = `${progress}%`;
}

function renderQuestionGrid() {
  elements.questionGrid.innerHTML = '';
  for (let i = 0; i < EXAM_LENGTH; i++) {
    const btn = document.createElement('button');
    btn.textContent = i + 1;
    btn.addEventListener('click', () => {
      currentQuestionIndex = i;
      renderQuestion();
    });
    elements.questionGrid.appendChild(btn);
  }
  updateQuestionGrid();
}

function updateQuestionGrid() {
  const buttons = elements.questionGrid.querySelectorAll('button');
  buttons.forEach((btn, index) => {
    btn.classList.remove('answered', 'flagged', 'current');
    if (userAnswers[index]) btn.classList.add('answered');
    if (flaggedQuestions.has(index)) btn.classList.add('flagged');
    if (index === currentQuestionIndex) btn.classList.add('current');
  });
}

function goToPreviousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
}

function goToNextQuestion() {
  if (currentQuestionIndex < EXAM_LENGTH - 1) {
    currentQuestionIndex++;
    renderQuestion();
  }
}

function toggleFlag() {
  if (flaggedQuestions.has(currentQuestionIndex)) {
    flaggedQuestions.delete(currentQuestionIndex);
  } else {
    flaggedQuestions.add(currentQuestionIndex);
  }
  elements.flagBtn.textContent = flaggedQuestions.has(currentQuestionIndex) ? 'Unflag' : 'Flag for Review';
  saveExamState();
  updateQuestionGrid();
}

function submitExam() {
  clearInterval(timerInterval);
  localStorage.removeItem('examState');
  
  let correctCount = 0;
  examQuestions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    if (!userAnswer) return;
    
    if (question.multi) {
      const sortedUser = [...userAnswer].sort();
      const sortedCorrect = [...question.correct].sort();
      if (JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)) {
        correctCount++;
      }
    } else {
      if (userAnswer === question.correct[0]) {
        correctCount++;
      }
    }
  });

  const percentage = Math.round((correctCount / EXAM_LENGTH) * 100);
  const passed = percentage >= PASSING_PERCENTAGE;
  const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);
  
  saveToLeaderboard(currentUsername, correctCount, percentage, TIME_LIMIT - timeRemaining);
  
  showScreen('results');
  
  elements.scoreValue.textContent = `${correctCount} / ${EXAM_LENGTH}`;
  elements.scorePercentage.textContent = `${percentage}%`;
  elements.passFail.textContent = passed ? 'PASSED' : 'FAILED';
  elements.passFail.className = `pass-fail ${passed ? 'pass' : 'fail'}`;
  elements.timeTaken.textContent = formatTime(TIME_LIMIT - timeRemaining);
}

function startReview() {
  currentQuestionIndex = 0;
  showScreen('review');
  renderReviewQuestion();
  renderReviewGrid();
}

function renderReviewQuestion() {
  const question = examQuestions[currentQuestionIndex];
  elements.reviewQuestionNumber.textContent = `Question ${currentQuestionIndex + 1} / ${EXAM_LENGTH}`;
  elements.reviewQuestionText.textContent = question.question;

  elements.reviewQuestionImage.innerHTML = '';
  if (question.image) {
    const img = document.createElement('img');
    img.src = question.image;
    elements.reviewQuestionImage.appendChild(img);
  }

  elements.reviewChoicesContainer.innerHTML = '';
  const userAnswer = userAnswers[currentQuestionIndex];

  question.choices.forEach(choice => {
    const choiceItem = document.createElement('div');
    choiceItem.className = 'choice-item';

    const label = document.createElement('div');
    label.className = 'choice-label';
    label.textContent = `${choice.label}. ${choice.text}`;

    const isCorrect = question.correct.includes(choice.label);
    const isUserAnswer = userAnswer && (question.multi ? userAnswer.includes(choice.label) : userAnswer === choice.label);

    if (isCorrect) {
      choiceItem.classList.add('correct');
    } else if (isUserAnswer) {
      choiceItem.classList.add('incorrect');
    }

    choiceItem.appendChild(label);
    elements.reviewChoicesContainer.appendChild(choiceItem);
  });

  elements.explanationContainer.innerHTML = '';
  if (question.explanation) {
    const title = document.createElement('div');
    title.className = 'explanation-title';
    title.textContent = 'Explanation';

    const text = document.createElement('div');
    text.className = 'explanation-text';
    text.textContent = question.explanation;

    elements.explanationContainer.appendChild(title);
    elements.explanationContainer.appendChild(text);
  }

  elements.reviewPrevBtn.disabled = currentQuestionIndex === 0;
  elements.reviewNextBtn.disabled = currentQuestionIndex === EXAM_LENGTH - 1;

  updateReviewGrid();
}

function renderReviewGrid() {
  elements.reviewGrid.innerHTML = '';
  for (let i = 0; i < EXAM_LENGTH; i++) {
    const btn = document.createElement('button');
    btn.textContent = i + 1;
    btn.addEventListener('click', () => {
      currentQuestionIndex = i;
      renderReviewQuestion();
    });
    elements.reviewGrid.appendChild(btn);
  }
  updateReviewGrid();
}

function updateReviewGrid() {
  const buttons = elements.reviewGrid.querySelectorAll('button');
  buttons.forEach((btn, index) => {
    btn.classList.remove('answered', 'flagged', 'current', 'incorrect');
    const question = examQuestions[index];
    const userAnswer = userAnswers[index];
    let isCorrect = false;
    
    if (userAnswer) {
      if (question.multi) {
        const sortedUser = [...userAnswer].sort();
        const sortedCorrect = [...question.correct].sort();
        isCorrect = JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
      } else {
        isCorrect = userAnswer === question.correct[0];
      }
    }

    if (isCorrect) btn.classList.add('answered');
    else if (userAnswer) btn.classList.add('incorrect');
    if (index === currentQuestionIndex) btn.classList.add('current');
  });
}

function saveExamState() {
  const state = {
    examQuestions,
    currentQuestionIndex,
    userAnswers,
    flaggedQuestions: Array.from(flaggedQuestions),
    timeRemaining,
    startTime,
    username: currentUsername
  };
  localStorage.setItem('examState', JSON.stringify(state));
}

function loadExamState() {
  const savedState = localStorage.getItem('examState');
  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      if (state.examQuestions && state.examQuestions.length > 0) {
        examQuestions = state.examQuestions;
        currentQuestionIndex = state.currentQuestionIndex;
        userAnswers = state.userAnswers;
        flaggedQuestions = new Set(state.flaggedQuestions);
        timeRemaining = state.timeRemaining;
        startTime = state.startTime;
        currentUsername = state.username || '';
        if (currentUsername && elements.usernameInput) {
          elements.usernameInput.value = currentUsername;
        }
        return true;
      }
    } catch (e) {
      console.error('Invalid saved state:', e);
    }
  }
  return false;
}

function retakeExam() {
  localStorage.removeItem('examState');
  showScreen('start');
}

elements.startBtn.addEventListener('click', () => {
  localStorage.removeItem('examState');
  startExam();
});

elements.prevBtn.addEventListener('click', goToPreviousQuestion);
elements.nextBtn.addEventListener('click', goToNextQuestion);
elements.flagBtn.addEventListener('click', toggleFlag);
elements.submitBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to submit the exam?')) {
    submitExam();
  }
});
elements.reviewBtn.addEventListener('click', startReview);
elements.retakeBtn.addEventListener('click', retakeExam);
elements.backToResultsBtn.addEventListener('click', () => showScreen('results'));
elements.reviewPrevBtn.addEventListener('click', () => {
  currentQuestionIndex--;
  renderReviewQuestion();
});
elements.reviewNextBtn.addEventListener('click', () => {
  currentQuestionIndex++;
  renderReviewQuestion();
});

document.addEventListener('keydown', (e) => {
  if (screens.exam.classList.contains('active')) {
    if (e.key === 'ArrowLeft') {
      goToPreviousQuestion();
    } else if (e.key === 'ArrowRight') {
      goToNextQuestion();
    } else if (e.key === ' ') {
      e.preventDefault();
      toggleFlag();
    }
  }
});

loadQuestions();
