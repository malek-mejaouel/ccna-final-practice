
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const datasetDir = path.join(__dirname, 'dataset');

async function extractQuestions() {
  try {
    const files = fs.readdirSync(datasetDir);
    const pdfFiles = files.filter(f => f.endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      console.error('No PDF files found in dataset/ folder!');
      return;
    }

    console.log('Found PDF files:', pdfFiles);

    const allQuestions = [];
    let questionId = 1;

    for (const pdfFile of pdfFiles) {
      const pdfPath = path.join(datasetDir, pdfFile);
      const dataBuffer = fs.readFileSync(pdfPath);
      
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      await parser.destroy();
      
      console.log('Extracted text from', pdfFile);
      
      const lines = result.text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      console.log('First 200 lines:', lines.slice(0, 200));
      
      fs.writeFileSync(path.join(__dirname, 'dataset', 'pdf-content-new.txt'), lines.join('\n'));
      console.log('Saved full text to dataset/pdf-content-new.txt');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

extractQuestions();
