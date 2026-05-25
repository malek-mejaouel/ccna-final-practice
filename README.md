
# CCNA Final Exam Simulation Website

A complete CCNA exam simulation website that runs entirely in the browser.

## Project Structure

```
project/
├── dataset/             # Place your CCNA PDF(s) here
├── index.html           # Main HTML file
├── style.css            # Styling
├── app.js               # Application logic
├── parser.js            # PDF parsing script (Node.js)
├── questions.json       # Generated questions file
└── README.md            # This file
```

## Getting Started

### 1. Using the Sample Questions

The project comes with a sample `questions.json` file to get you started immediately.

### 2. Running the Website

Simply open `index.html` in your browser.

Or, if you want to run a local server:

```bash
# Using Python
python -m http.server 8000

# Or using Node.js (http-server)
npx http-server
```

Then navigate to `http://localhost:8000` in your browser.

## Features

- **Randomized Questions**: 60 random questions selected from the question bank each time
- **Shuffled Choices**: Answer choices are shuffled for each question
- **Single & Multi-Answer Questions**: Supports both radio buttons and checkboxes
- **90-Minute Timer**: Automatic submission when time runs out
- **Flag for Review**: Mark questions to come back to later
- **Progress Saving**: Exam progress is saved to localStorage
- **Answer Review**: Review all questions with explanations after submission
- **Keyboard Shortcuts**: Arrow keys for navigation, space to flag
- **Responsive Design**: Works on desktop and tablet

## Exam Details

- **Total Questions**: 60
- **Time Limit**: 90 minutes
- **Passing Score**: 82% (825/1000 CCNA scale)

## Question Format

Questions are stored in `questions.json` in the following format:

```json
[
  {
    "id": 1,
    "question": "Which protocol operates at Layer 3?",
    "image": null,
    "choices": [
      { "label": "A", "text": "HTTP" },
      { "label": "B", "text": "IP" },
      { "label": "C", "text": "TCP" },
      { "label": "D", "text": "FTP" }
    ],
    "correct": ["B"],
    "multi": false,
    "explanation": "IP operates at the Network layer (Layer 3)..."
  }
]
```

## Customization

You can customize the exam by editing `questions.json` with your own questions.

## License

MIT
