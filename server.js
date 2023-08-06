const http = require('http');
const fs = require('fs');
const path = require('path');
const { createReadStream } = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

const server = http.createServer(async (req, res) => {
  if (req.url === '/upload' && req.method === 'POST') {
    const form = new FormData();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Error parsing form data');
        return;
      }

      const { avatar } = files;
      if (!avatar || !avatar.name) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('No image file uploaded');
        return;
      }

      const imageFileName = avatar.name;
      const imagePath = path.resolve(__dirname, imageFileName);

      // Save the image file as a variable (in-memory)
      const imageBuffer = fs.readFileSync(avatar.path);

      // Now you can use the imageBuffer variable as needed
      // For example, you can send it using fetch to another server
      try {
        const response = await fetch('https://nftube.cam/upload/upload.php', {
          method: 'POST',
          body: imageBuffer,
          headers: {
            'Content-Type': avatar.type,
          },
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Upload successful:', result);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>Image uploaded and processed successfully</h1>');
        } else {
          console.error('Upload failed:', response.statusText);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error uploading image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error uploading image');
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
