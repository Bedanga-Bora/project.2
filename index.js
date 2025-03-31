// api/index.js
const express = require('express');
const multer = require('multer');
const admzip = require('adm-zip');
const csv = require('csv-parse');
const fs = require('fs');
const { promisify } = require('util');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/', upload.single('file'), async (req, res) => {
  try {
    const question = req.body.question;
    let answer = '';

    // Check if a file was uploaded
    if (req.file) {
      // Handle the specific zip file case mentioned in the example
      if (question.includes('unzip file') && question.includes('extract.csv')) {
        // Extract zip
        const zip = new admzip(req.file.path);
        zip.extractAllTo('temp/', true);
        
        // Read CSV
        const csvPath = 'temp/extract.csv';
        const parser = fs
          .createReadStream(csvPath)
          .pipe(csv.parse({ columns: true }));
        
        // Get first row's answer column
        for await (const row of parser) {
          answer = row['answer'];
          break;
        }
        
        // Cleanup
        fs.unlinkSync(req.file.path);
        fs.unlinkSync(csvPath);
      }
    }

    res.json({ answer: answer || 'No answer found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ answer: 'Error processing request' });
  }
});

module.exports = app;