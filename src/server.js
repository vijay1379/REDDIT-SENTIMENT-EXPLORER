const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();

app.use(express.static('public'));

// Function to execute the Python script to generate the image and JSON
function generateImage() {
  var productName = document.getElementById('productName').value;

  document.getElementById('loader').style.display = 'block';

  // Correct URL construction
  fetch(`https://redit-sentiment-analyser.onrender.com/getDataAndImage/${productName}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.json();
    })
    .then(data => {
      if (data.imagePath) {
        const imageSrc = `https://redit-sentiment-analyser.onrender.com${data.imagePath}`;
        const img = document.getElementById('generatedImage');
        img.onload = function() {
          document.getElementById('imageContainer').style.display = 'block';
          document.getElementById('loader').style.display = 'none';
          displayComments(data.comments);
        };
        img.src = imageSrc;
      } else {
        document.getElementById('loader').style.display = 'none';
      }
    })
    .catch(error => {
      console.error('Error fetching image and data:', error);
      alert('Failed to fetch image and data.');
      document.getElementById('loader').style.display = 'none';
    });
}


// Endpoint to execute Python script and serve JSON and image
app.get('/getDataAndImage/:product_name', async (req, res) => {
  const productName = req.params.product_name;

  try {
    await executePythonScript(productName);

    const commentsPath = path.join(__dirname, '..', 'sentiment_comments.json');
    const imagePath = path.join(__dirname, '..', 'sentiment_chart.png');

    const dataExists = fs.existsSync(commentsPath);
    const imageExists = fs.existsSync(imagePath);

    if (dataExists && imageExists) {
      const commentsData = fs.readFileSync(commentsPath, 'utf8');
      const comments = JSON.parse(commentsData);
      res.json({ comments, imagePath: '/getImage' });
      res.once('finish', () => {
        fs.unlink(commentsPath, deleteErr => {
          if (deleteErr) {
            console.error('JSON file deletion error:', deleteErr);
          } else {
            console.log('JSON file deleted successfully');
          }
        });
      });
    } else {
      res.status(404).send('Data or image not found');
    }
  } catch (error) {
    res.status(500).send('Failed to generate data or image');
  }
});

app.get('/getImage', (req, res) => {
  const imagePath = path.join(__dirname, '..', 'sentiment_chart.png');
  res.sendFile(imagePath,err => {
    if (err) {
      console.error('File sending error:', err);
      res.status(err.status).end();
    } else {
      fs.unlink(imagePath, deleteErr => {
        if (deleteErr) {
          console.error('File deletion error:', deleteErr);
        } else {
          console.log('File deleted successfully');
        }  
      });
    }
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
