
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const datasetDir = path.join(__dirname, 'dataset');
const pdfFiles = fs.readdirSync(datasetDir).filter(file => file.endsWith('.pdf'));

if (pdfFiles.length === 0) {
  console.error('No PDF files found in dataset/');
  process.exit(1);
}

const pdfPath = path.join(datasetDir, pdfFiles[0]);
const dataBuffer = fs.readFileSync(pdfPath);

async function run() {
  try {
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    await parser.destroy();
    console.log('PDF text content (first 5000 chars):');
    console.log(result.text.substring(0, 5000));
    fs.writeFileSync(path.join(datasetDir, 'pdf-content.txt'), result.text);
    console.log('\nFull content saved to dataset/pdf-content.txt');
  } catch (err) {
    console.error('Error parsing PDF:', err);
  }
}

run();
