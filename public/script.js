function generateImage() {
  var productName = document.getElementById('productName').value;

  document.getElementById('loader').style.display = 'block';

  fetch(`https://redit-sentiment-analyser.onrender.com${productName}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.json();
    })
    .then(data => {
      if (data.imagePath) {
        const imageSrc = `https://redit-sentiment-analyser.onrender.com/${data.imagePath}`;
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

function displayComments(comments) {
  var positiveComment = document.querySelector('#topPositiveScored p');
  var negativeComment = document.querySelector('#topNegativeScored p');

  positiveComment.textContent = comments.highest_positive_comment;
  negativeComment.textContent = comments.lowest_negative_comment;

  document.getElementById('topCommentsScored').style.display = 'block';
}
